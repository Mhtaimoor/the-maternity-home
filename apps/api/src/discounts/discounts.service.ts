import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async upsert(data: {
    id?: string;
    code: string;
    type: 'PERCENT' | 'FIXED';
    value: number;
    minOrder?: number;
    usageLimit?: number | null;
    startsAt?: string | null;
    endsAt?: string | null;
    active?: boolean;
  }) {
    if (!['PERCENT', 'FIXED'].includes(data.type)) throw new BadRequestException('Invalid type');
    if (data.type === 'PERCENT' && (data.value <= 0 || data.value > 100)) {
      throw new BadRequestException('Percent must be 1-100');
    }
    const payload = {
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minOrder: data.minOrder ?? 0,
      usageLimit: data.usageLimit ?? null,
      startsAt: data.startsAt ? new Date(data.startsAt) : null,
      endsAt: data.endsAt ? new Date(data.endsAt) : null,
      active: data.active ?? true,
    };
    if (data.id) {
      return this.prisma.coupon.update({ where: { id: data.id }, data: payload });
    }
    return this.prisma.coupon.create({ data: payload });
  }

  async preview(code: string, subtotal: number) {
    const coupon = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.active) throw new BadRequestException('Invalid coupon');
    if (coupon.startsAt && coupon.startsAt > new Date()) throw new BadRequestException('Coupon not started');
    if (coupon.endsAt && coupon.endsAt < new Date()) throw new BadRequestException('Coupon expired');
    if (subtotal < coupon.minOrder) throw new BadRequestException('Below minimum order');
    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException('Usage limit reached');
    }
    const discount =
      coupon.type === 'PERCENT'
        ? Math.round(((subtotal * coupon.value) / 100) * 100) / 100
        : Math.min(coupon.value, subtotal);
    return { code: coupon.code, discount, type: coupon.type, value: coupon.value };
  }
}
