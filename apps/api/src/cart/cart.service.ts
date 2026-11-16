import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type CartItem = { variantId: string; quantity: number };
type Cart = { items: CartItem[]; updatedAt: number };

@Injectable()
export class CartService {
  private carts = new Map<string, Cart>();

  constructor(private prisma: PrismaService) {}

  private getOrCreate(cartId: string): Cart {
    let cart = this.carts.get(cartId);
    if (!cart) {
      cart = { items: [], updatedAt: Date.now() };
      this.carts.set(cartId, cart);
    }
    return cart;
  }

  async getCart(cartId: string) {
    const cart = this.getOrCreate(cartId);
    return this.hydrate(cart);
  }

  async setItem(cartId: string, variantId: string, quantity: number) {
    if (quantity < 0) throw new BadRequestException('Invalid quantity');
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });
    if (!variant || !variant.active || variant.product.status !== 'ACTIVE') {
      throw new NotFoundException('Variant unavailable');
    }
    const available = variant.stock - variant.reserved;
    if (quantity > available) {
      throw new BadRequestException(`Only ${available} available`);
    }

    const cart = this.getOrCreate(cartId);
    cart.items = cart.items.filter((i) => i.variantId !== variantId);
    if (quantity > 0) cart.items.push({ variantId, quantity });
    cart.updatedAt = Date.now();
    return this.hydrate(cart);
  }

  async removeItem(cartId: string, variantId: string) {
    return this.setItem(cartId, variantId, 0);
  }

  clear(cartId: string) {
    this.carts.delete(cartId);
    return { items: [], subtotal: 0 };
  }

  peek(cartId: string) {
    return this.getOrCreate(cartId);
  }

  private async hydrate(cart: Cart) {
    const items = [];
    let subtotal = 0;
    for (const line of cart.items) {
      const variant = await this.prisma.productVariant.findUnique({
        where: { id: line.variantId },
        include: { product: { include: { images: { orderBy: { sortOrder: 'asc' }, take: 1 } } } },
      });
      if (!variant) continue;
      const unitPrice =
        (variant.product.salePrice ?? variant.product.sellingPrice) + variant.priceAdjustment;
      const lineTotal = unitPrice * line.quantity;
      subtotal += lineTotal;
      items.push({
        variantId: variant.id,
        productId: variant.productId,
        productName: variant.product.name,
        variantName: variant.name,
        sku: variant.sku,
        quantity: line.quantity,
        unitPrice,
        lineTotal,
        available: Math.max(0, variant.stock - variant.reserved),
        imageUrl: variant.product.images[0]?.url ?? null,
      });
    }
    return { items, subtotal };
  }
}
