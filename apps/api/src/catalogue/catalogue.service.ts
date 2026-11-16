import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductStatus } from '../common/constants';

import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

@Injectable()
export class CatalogueService {
  constructor(
    private prisma: PrismaService,
    private audit: AuditService,
  ) {}

  listCategories(includeInactive = false) {
    return this.prisma.category.findMany({
      where: includeInactive ? undefined : { active: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async upsertCategory(
    data: {
      id?: string;
      name: string;
      description?: string;
      sortOrder?: number;
      active?: boolean;
      imageUrl?: string;
    },
    actorId?: string,
  ) {
    const slug = slugify(data.name);
    const category = data.id
      ? await this.prisma.category.update({
          where: { id: data.id },
          data: {
            name: data.name,
            slug,
            description: data.description,
            sortOrder: data.sortOrder ?? 0,
            active: data.active ?? true,
            imageUrl: data.imageUrl,
          },
        })
      : await this.prisma.category.create({
          data: {
            name: data.name,
            slug,
            description: data.description,
            sortOrder: data.sortOrder ?? 0,
            active: data.active ?? true,
            imageUrl: data.imageUrl,
          },
        });
    if (actorId) {
      await this.audit.log({
        actorId,
        action: data.id ? 'UPDATE_CATEGORY' : 'CREATE_CATEGORY',
        entity: 'Category',
        entityId: category.id,
        summary: category.name,
      });
    }
    return category;
  }

  async listProducts(query: {
    q?: string;
    category?: string;
    status?: ProductStatus;
    featured?: boolean;
    publicOnly?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }) {
    const where: Prisma.ProductWhereInput = {};
    if (query.publicOnly) where.status = ProductStatus.ACTIVE;
    else if (query.status) where.status = query.status;
    if (query.featured) where.featured = true;
    if (query.category) {
      where.OR = [{ categoryId: query.category }, { category: { slug: query.category } }];
    }
    if (query.q) {
      where.AND = [
        {
          OR: [
            { name: { contains: query.q } },
            { brand: { contains: query.q } },
            { sku: { contains: query.q } },
            { description: { contains: query.q } },
          ],
        },
      ];
    }
    if (query.minPrice != null || query.maxPrice != null) {
      where.sellingPrice = {};
      if (query.minPrice != null) where.sellingPrice.gte = query.minPrice;
      if (query.maxPrice != null) where.sellingPrice.lte = query.maxPrice;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'price_asc') orderBy = { sellingPrice: 'asc' };
    if (query.sort === 'price_desc') orderBy = { sellingPrice: 'desc' };
    if (query.sort === 'newest') orderBy = { createdAt: 'desc' };

    const products = await this.prisma.product.findMany({
      where,
      orderBy,
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: query.publicOnly ? { active: true } : undefined },
      },
    });

    return products.map((p) => this.mapProduct(p, !query.publicOnly));
  }

  async getProduct(idOrSlug: string, publicOnly = false) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        ...(publicOnly ? { status: ProductStatus.ACTIVE } : {}),
      },
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: publicOnly ? { active: true } : undefined },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return this.mapProduct(product, !publicOnly);
  }

  async createProduct(
    data: {
      name: string;
      sku: string;
      description?: string;
      brand?: string;
      categoryId?: string;
      costPrice?: number;
      sellingPrice: number;
      salePrice?: number;
      lowStockThreshold?: number;
      status?: ProductStatus;
      featured?: boolean;
      variants?: Array<{
        name: string;
        sku: string;
        size?: string;
        color?: string;
        pack?: string;
        priceAdjustment?: number;
        stock?: number;
      }>;
      images?: Array<{ url: string; alt?: string }>;
    },
    actorId?: string,
  ) {
    const slugBase = slugify(data.name);
    let slug = slugBase;
    let i = 1;
    while (await this.prisma.product.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${i++}`;
    }

    const product = await this.prisma.product.create({
      data: {
        name: data.name,
        slug,
        sku: data.sku,
        description: data.description,
        brand: data.brand,
        categoryId: data.categoryId,
        costPrice: data.costPrice ?? 0,
        sellingPrice: data.sellingPrice,
        salePrice: data.salePrice,
        lowStockThreshold: data.lowStockThreshold ?? 5,
        status: data.status ?? ProductStatus.DRAFT,
        featured: data.featured ?? false,
        variants: data.variants?.length
          ? {
              create: data.variants.map((v) => ({
                name: v.name,
                sku: v.sku,
                size: v.size,
                color: v.color,
                pack: v.pack,
                priceAdjustment: v.priceAdjustment ?? 0,
                stock: v.stock ?? 0,
              })),
            }
          : {
              create: [
                {
                  name: 'Default',
                  sku: `${data.sku}-DEF`,
                  stock: 0,
                },
              ],
            },
        images: data.images?.length
          ? {
              create: data.images.map((img, idx) => ({
                url: img.url,
                alt: img.alt,
                sortOrder: idx,
              })),
            }
          : undefined,
      },
      include: { category: true, images: true, variants: true },
    });

    if (actorId) {
      await this.audit.log({
        actorId,
        action: 'CREATE_PRODUCT',
        entity: 'Product',
        entityId: product.id,
        summary: `${product.name} (${product.sku})`,
      });
    }
    return this.mapProduct(product, true);
  }

  async updateProduct(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      brand: string;
      categoryId: string | null;
      costPrice: number;
      sellingPrice: number;
      salePrice: number | null;
      lowStockThreshold: number;
      status: string;
      featured: boolean;
    }>,
    actorId?: string,
  ) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        ...data,
        ...(data.name ? { slug: slugify(data.name) } : {}),
      },
      include: { category: true, images: true, variants: true },
    });
    if (actorId) {
      await this.audit.log({
        actorId,
        action: 'UPDATE_PRODUCT',
        entity: 'Product',
        entityId: id,
        summary: `Updated ${product.name}`,
      });
    }
    return this.mapProduct(product, true);
  }

  async adjustStock(
    input: { productId: string; variantId: string; delta: number; reason: string },
    actorId?: string,
  ) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: input.variantId },
    });
    if (!variant || variant.productId !== input.productId) {
      throw new NotFoundException('Variant not found');
    }
    const next = variant.stock + input.delta;
    if (next < 0) throw new BadRequestException('Stock cannot go negative');
    if (next < variant.reserved) {
      throw new BadRequestException('Stock cannot fall below reserved quantity');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.productVariant.update({
        where: { id: variant.id },
        data: { stock: next },
      }),
      this.prisma.inventoryMovement.create({
        data: {
          productId: input.productId,
          variantId: input.variantId,
          delta: input.delta,
          reason: input.reason,
          staffId: actorId,
        },
      }),
    ]);

    if (actorId) {
      await this.audit.log({
        actorId,
        action: 'ADJUST_STOCK',
        entity: 'ProductVariant',
        entityId: variant.id,
        summary: `${input.delta > 0 ? '+' : ''}${input.delta} (${input.reason})`,
      });
    }
    return updated;
  }

  private mapProduct(
    product: {
      id: string;
      name: string;
      slug: string;
      sku: string;
      description: string | null;
      brand: string | null;
      costPrice: number;
      sellingPrice: number;
      salePrice: number | null;
      lowStockThreshold: number;
      status: string;
      featured: boolean;
      category: { id: string; name: string; slug: string } | null;
      images: Array<{ id: string; url: string; alt: string | null; sortOrder: number }>;
      variants: Array<{
        id: string;
        name: string;
        sku: string;
        size: string | null;
        color: string | null;
        pack: string | null;
        priceAdjustment: number;
        stock: number;
        reserved: number;
        active: boolean;
      }>;
    },
    includeCost: boolean,
  ) {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      description: product.description,
      brand: product.brand,
      ...(includeCost ? { costPrice: product.costPrice } : {}),
      sellingPrice: product.sellingPrice,
      salePrice: product.salePrice,
      displayPrice: product.salePrice ?? product.sellingPrice,
      lowStockThreshold: product.lowStockThreshold,
      status: product.status,
      featured: product.featured,
      category: product.category,
      images: product.images,
      variants: product.variants.map((v) => ({
        ...v,
        available: Math.max(0, v.stock - v.reserved),
        unitPrice: (product.salePrice ?? product.sellingPrice) + v.priceAdjustment,
      })),
    };
  }
}



