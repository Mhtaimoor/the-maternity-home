import { Injectable } from '@nestjs/common';
import { OrderStatus } from '../common/constants';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async dashboard() {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const [todayOrders, pending, paidToday, lowStock, recent, best] = await Promise.all([
      this.prisma.order.count({ where: { createdAt: { gte: start } } }),
      this.prisma.order.count({
        where: { status: { in: [OrderStatus.NEW, OrderStatus.CONFIRMED, OrderStatus.PROCESSING] } },
      }),
      this.prisma.order.aggregate({
        where: { createdAt: { gte: start }, paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
      this.prisma.productVariant.findMany({
        where: { active: true },
        include: { product: true },
        take: 50,
      }),
      this.prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { items: true },
      }),
      this.prisma.orderItem.groupBy({
        by: ['productName', 'sku'],
        _sum: { quantity: true, lineTotal: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const low = lowStock
      .filter((v) => v.stock - v.reserved <= (v.product.lowStockThreshold ?? 5))
      .slice(0, 10)
      .map((v) => ({
        productName: v.product.name,
        variantName: v.name,
        sku: v.sku,
        available: v.stock - v.reserved,
        threshold: v.product.lowStockThreshold,
      }));

    return {
      todayOrders,
      pendingOrders: pending,
      todaySales: paidToday._sum.total ?? 0,
      lowStock: low,
      recentOrders: recent,
      bestSellers: best,
    };
  }

  async salesByDate(from?: string, to?: string) {
    const gte = from ? new Date(from) : new Date(Date.now() - 30 * 86400000);
    const lte = to ? new Date(to) : new Date();
    const orders = await this.prisma.order.findMany({
      where: { createdAt: { gte, lte }, status: { not: OrderStatus.CANCELLED } },
      select: { createdAt: true, total: true, status: true, paymentStatus: true },
    });
    const map = new Map<string, { date: string; orders: number; revenue: number }>();
    for (const o of orders) {
      const date = o.createdAt.toISOString().slice(0, 10);
      const row = map.get(date) ?? { date, orders: 0, revenue: 0 };
      row.orders += 1;
      row.revenue += o.total;
      map.set(date, row);
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async ordersByStatus() {
    const groups = await this.prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    return groups.map((g) => ({ status: g.status, count: g._count._all }));
  }

  async stockValuation() {
    const variants = await this.prisma.productVariant.findMany({
      include: { product: true },
    });
    return variants.map((v) => ({
      sku: v.sku,
      productName: v.product.name,
      stock: v.stock,
      reserved: v.reserved,
      unitCost: v.product.costPrice,
      value: v.stock * v.product.costPrice,
    }));
  }
}



