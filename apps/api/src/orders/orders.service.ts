import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrderStatus, PaymentMethod, PaymentStatus } from '../common/constants';

import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

const FLOW: OrderStatus[] = [
  OrderStatus.NEW,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.PACKED,
  OrderStatus.DISPATCHED,
  OrderStatus.DELIVERED,
];

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private cart: CartService,
    private audit: AuditService,
    private notifications: NotificationsService,
  ) {}

  private nextOrderNumber() {
    const d = new Date();
    const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `TMH-${stamp}-${rand}`;
  }

  async checkout(input: {
    cartId: string;
    name: string;
    phone: string;
    email?: string;
    city: string;
    addressLine1: string;
    addressLine2?: string;
    deliveryNotes?: string;
    paymentMethod: PaymentMethod;
    couponCode?: string;
  }) {
    if (!input.name?.trim() || !input.phone?.trim() || !input.city?.trim() || !input.addressLine1?.trim()) {
      throw new BadRequestException('Missing required checkout fields');
    }

    const zone = await this.prisma.deliveryZone.findFirst({
      where: { city: { equals: input.city }, active: true },
    });
    if (!zone) throw new BadRequestException(`Delivery not available for ${input.city}`);
    if (input.paymentMethod === PaymentMethod.COD && !zone.codAvailable) {
      throw new BadRequestException('COD not available for this city');
    }

    const raw = this.cart.peek(input.cartId);
    if (!raw.items.length) throw new BadRequestException('Cart is empty');

    const order = await this.prisma.$transaction(async (tx) => {
      const lines: Array<{
        productId: string;
        variantId: string;
        productName: string;
        sku: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
      }> = [];

      for (const item of raw.items) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { product: true },
        });
        if (!variant || !variant.active || variant.product.status !== 'ACTIVE') {
          throw new BadRequestException('A cart item is unavailable');
        }
        const available = variant.stock - variant.reserved;
        if (item.quantity > available) {
          throw new BadRequestException(`Insufficient stock for ${variant.product.name}`);
        }
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { reserved: { increment: item.quantity } },
        });
        const unitPrice =
          (variant.product.salePrice ?? variant.product.sellingPrice) + variant.priceAdjustment;
        lines.push({
          productId: variant.productId,
          variantId: variant.id,
          productName: variant.product.name,
          sku: variant.sku,
          quantity: item.quantity,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
        });
      }

      const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
      let discount = 0;
      let couponCode: string | undefined;
      if (input.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: input.couponCode.toUpperCase() },
        });
        if (!coupon || !coupon.active) throw new BadRequestException('Invalid coupon');
        if (coupon.startsAt && coupon.startsAt > new Date()) throw new BadRequestException('Coupon not started');
        if (coupon.endsAt && coupon.endsAt < new Date()) throw new BadRequestException('Coupon expired');
        if (subtotal < coupon.minOrder) throw new BadRequestException('Order below coupon minimum');
        if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
          throw new BadRequestException('Coupon usage limit reached');
        }
        discount =
          coupon.type === 'PERCENT'
            ? Math.round(((subtotal * coupon.value) / 100) * 100) / 100
            : Math.min(coupon.value, subtotal);
        couponCode = coupon.code;
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      let deliveryFee = zone.rate;
      if (zone.freeAbove != null && subtotal - discount >= zone.freeAbove) deliveryFee = 0;
      const total = Math.max(0, subtotal - discount + deliveryFee);

      let customer = await tx.customer.findUnique({ where: { phone: input.phone } });
      if (!customer) {
        customer = await tx.customer.create({
          data: {
            name: input.name,
            phone: input.phone,
            email: input.email,
            addresses: {
              create: {
                line1: input.addressLine1,
                line2: input.addressLine2,
                city: input.city,
                notes: input.deliveryNotes,
              },
            },
          },
        });
      }

      const created = await tx.order.create({
        data: {
          orderNumber: this.nextOrderNumber(),
          customerId: customer.id,
          customerName: input.name,
          customerPhone: input.phone,
          customerEmail: input.email,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2,
          city: input.city,
          deliveryNotes: input.deliveryNotes,
          paymentMethod: input.paymentMethod,
          paymentStatus:
            input.paymentMethod === PaymentMethod.GATEWAY
              ? PaymentStatus.PENDING
              : PaymentStatus.UNPAID,
          subtotal,
          deliveryFee,
          discount,
          total,
          couponCode,
          items: { create: lines },
          payments: {
            create: {
              provider:
                input.paymentMethod === PaymentMethod.GATEWAY
                  ? 'mock-gateway'
                  : input.paymentMethod === PaymentMethod.COD
                    ? 'cod'
                    : 'bank-transfer',
              method: input.paymentMethod,
              amount: total,
              status:
                input.paymentMethod === PaymentMethod.GATEWAY
                  ? PaymentStatus.PENDING
                  : PaymentStatus.UNPAID,
              reference:
                input.paymentMethod === PaymentMethod.GATEWAY
                  ? `MOCK-${Date.now()}`
                  : undefined,
            },
          },
        },
        include: { items: true, payments: true },
      });

      return created;
    });

    this.cart.clear(input.cartId);
    await this.notifications.orderPlaced(order);
    return order;
  }

  async track(orderNumber: string, phone: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true, payments: true },
    });
    if (!order || order.customerPhone !== phone) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  listAdmin(query: { status?: OrderStatus; q?: string }) {
    const where: Prisma.OrderWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.q) {
      where.OR = [
        { orderNumber: { contains: query.q } },
        { customerPhone: { contains: query.q } },
        { customerName: { contains: query.q } },
      ];
    }
    return this.prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: true, payments: true },
    });
  }

  async getAdmin(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, payments: true, customer: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(
    id: string,
    input: {
      status: OrderStatus;
      cancelReason?: string;
      courierName?: string;
      trackingNumber?: string;
      internalNotes?: string;
    },
    actorId: string,
  ) {
    const order = await this.getAdmin(id);
    const next = input.status;

    if (next === OrderStatus.CANCELLED) {
      if (
        order.status === OrderStatus.DELIVERED ||
        order.status === OrderStatus.CANCELLED ||
        order.status === OrderStatus.REFUNDED
      ) {
        throw new BadRequestException('Cannot cancel this order');
      }
      await this.releaseReservations(order.id);
      const updated = await this.prisma.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelReason: input.cancelReason ?? 'Cancelled by staff',
          cancelledAt: new Date(),
          internalNotes: input.internalNotes ?? order.internalNotes,
        },
        include: { items: true, payments: true },
      });
      await this.audit.log({
        actorId,
        action: 'CANCEL_ORDER',
        entity: 'Order',
        entityId: id,
        summary: updated.orderNumber,
      });
      await this.notifications.statusUpdate(updated);
      return updated;
    }

    const currentIdx = FLOW.indexOf(order.status as OrderStatus);
    const nextIdx = FLOW.indexOf(next);
    if (nextIdx === -1 || currentIdx === -1 || nextIdx < currentIdx) {
      throw new BadRequestException(`Invalid status transition ${order.status} → ${next}`);
    }

    const data: Prisma.OrderUpdateInput = {
      status: next,
      internalNotes: input.internalNotes ?? order.internalNotes,
    };
    if (next === OrderStatus.DISPATCHED) {
      data.courierName = input.courierName ?? order.courierName;
      data.trackingNumber = input.trackingNumber ?? order.trackingNumber;
      data.dispatchedAt = new Date();
      if (!data.courierName || !data.trackingNumber) {
        throw new BadRequestException('Courier and tracking required to dispatch');
      }
    }
    if (next === OrderStatus.DELIVERED) {
      data.deliveredAt = new Date();
      // Commit reserved stock on delivery
      await this.commitReservations(order.id);
      if (order.paymentMethod === PaymentMethod.COD && order.paymentStatus !== PaymentStatus.PAID) {
        data.paymentStatus = PaymentStatus.PAID;
        await this.prisma.payment.updateMany({
          where: { orderId: id },
          data: { status: PaymentStatus.PAID, paidAt: new Date() },
        });
      }
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data,
      include: { items: true, payments: true },
    });
    await this.audit.log({
      actorId,
      action: 'UPDATE_ORDER_STATUS',
      entity: 'Order',
      entityId: id,
      summary: `${updated.orderNumber}: ${order.status} → ${next}`,
    });
    await this.notifications.statusUpdate(updated);
    return updated;
  }

  async markPayment(
    id: string,
    status: PaymentStatus,
    actorId: string,
    actorRole: string,
  ) {
    if (actorRole === 'ORDER_STAFF' && status === PaymentStatus.REFUNDED) {
      throw new ForbiddenException('Order staff cannot refund');
    }
    const order = await this.getAdmin(id);
    const updated = await this.prisma.order.update({
      where: { id },
      data: {
        paymentStatus: status,
        payments: {
          updateMany: {
            where: { orderId: id },
            data: {
              status,
              paidAt: status === PaymentStatus.PAID ? new Date() : undefined,
              refundedAt: status === PaymentStatus.REFUNDED ? new Date() : undefined,
            },
          },
        },
      },
      include: { items: true, payments: true },
    });
    await this.audit.log({
      actorId,
      action: 'MARK_PAYMENT',
      entity: 'Order',
      entityId: id,
      summary: `${order.orderNumber} payment → ${status}`,
    });
    return updated;
  }

  private async releaseReservations(orderId: string) {
    const items = await this.prisma.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      if (!item.variantId) continue;
      await this.prisma.productVariant.update({
        where: { id: item.variantId },
        data: { reserved: { decrement: item.quantity } },
      });
    }
  }

  private async commitReservations(orderId: string) {
    const items = await this.prisma.orderItem.findMany({ where: { orderId } });
    for (const item of items) {
      if (!item.variantId) continue;
      await this.prisma.productVariant.update({
        where: { id: item.variantId },
        data: {
          stock: { decrement: item.quantity },
          reserved: { decrement: item.quantity },
        },
      });
      if (item.productId) {
        await this.prisma.inventoryMovement.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            delta: -item.quantity,
            reason: `Order ${orderId} delivered`,
          },
        });
      }
    }
  }
}



