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

  async deleteCategory(id: string, actorId?: string) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Category not found');
    await this.prisma.category.delete({ where: { id } });
    if (actorId) {
      await this.audit.log({
        actorId,
        action: 'DELETE_CATEGORY',
        entity: 'Category',
        entityId: id,
        summary: `Deleted ${existing.name}`,
      });
    }
    return { success: true };
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
    data: any,
    actorId?: string,
  ) {
    const existing = await this.prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });
    if (!existing) throw new NotFoundException('Product not found');

    const { images, stock, variants, id: _id, ...scalarData } = data;

    const updateData: any = {};
    if (scalarData.name !== undefined) {
      updateData.name = scalarData.name;
      updateData.slug = slugify(scalarData.name);
    }
    if (scalarData.sku !== undefined) updateData.sku = scalarData.sku;
    if (scalarData.description !== undefined) updateData.description = scalarData.description;
    if (scalarData.brand !== undefined) updateData.brand = scalarData.brand;
    if (scalarData.categoryId !== undefined) updateData.categoryId = scalarData.categoryId || null;
    if (scalarData.costPrice !== undefined) updateData.costPrice = Number(scalarData.costPrice);
    if (scalarData.sellingPrice !== undefined) updateData.sellingPrice = Number(scalarData.sellingPrice);
    if (scalarData.salePrice !== undefined) {
      updateData.salePrice =
        scalarData.salePrice === null || scalarData.salePrice === ''
          ? null
          : Number(scalarData.salePrice);
    }
    if (scalarData.lowStockThreshold !== undefined) {
      updateData.lowStockThreshold = Number(scalarData.lowStockThreshold);
    }
    if (scalarData.status !== undefined) updateData.status = scalarData.status;
    if (scalarData.featured !== undefined) updateData.featured = Boolean(scalarData.featured);

    if (images !== undefined && Array.isArray(images)) {
      await this.prisma.productImage.deleteMany({ where: { productId: id } });
      if (images.length > 0) {
        await this.prisma.productImage.createMany({
          data: images
            .filter((img: any) => img && (typeof img === 'string' ? img : img.url))
            .map((img: any, idx: number) => ({
              productId: id,
              url: typeof img === 'string' ? img : img.url,
              alt: typeof img === 'string' ? scalarData.name || existing.name : img.alt || scalarData.name || existing.name,
              sortOrder: idx,
            })),
        });
      }
    }

    if (stock !== undefined && existing.variants[0]?.id) {
      await this.prisma.productVariant.update({
        where: { id: existing.variants[0].id },
        data: { stock: Math.max(0, Number(stock)) },
      });
    }

    const product = await this.prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: true,
      },
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

  async deleteProduct(id: string, actorId?: string) {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Product not found');
    await this.prisma.product.delete({ where: { id } });
    if (actorId) {
      await this.audit.log({
        actorId,
        action: 'DELETE_PRODUCT',
        entity: 'Product',
        entityId: id,
        summary: `Deleted ${existing.name}`,
      });
    }
    return { success: true };
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



