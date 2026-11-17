import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveryService {
  constructor(private prisma: PrismaService) {}

  list() {
    return this.prisma.deliveryZone.findMany({ orderBy: { city: 'asc' } });
  }

  listPublic() {
    return this.prisma.deliveryZone.findMany({
      where: { active: true },
      orderBy: { city: 'asc' },
      select: {
        city: true,
        rate: true,
        etaDaysMin: true,
        etaDaysMax: true,
        freeAbove: true,
        codAvailable: true,
      },
    });
  }

  upsert(data: {
    id?: string;
    city: string;
    rate: number;
    etaDaysMin?: number;
    etaDaysMax?: number;
    freeAbove?: number | null;
    active?: boolean;
    codAvailable?: boolean;
  }) {
    if (data.id) {
      return this.prisma.deliveryZone.update({
        where: { id: data.id },
        data: {
          city: data.city,
          rate: data.rate,
          etaDaysMin: data.etaDaysMin ?? 2,
          etaDaysMax: data.etaDaysMax ?? 5,
          freeAbove: data.freeAbove,
          active: data.active ?? true,
          codAvailable: data.codAvailable ?? true,
        },
      });
    }
    return this.prisma.deliveryZone.upsert({
      where: { city: data.city },
      create: {
        city: data.city,
        rate: data.rate,
        etaDaysMin: data.etaDaysMin ?? 2,
        etaDaysMax: data.etaDaysMax ?? 5,
        freeAbove: data.freeAbove,
        active: data.active ?? true,
        codAvailable: data.codAvailable ?? true,
      },
      update: {
        rate: data.rate,
        etaDaysMin: data.etaDaysMin ?? 2,
        etaDaysMax: data.etaDaysMax ?? 5,
        freeAbove: data.freeAbove,
        active: data.active ?? true,
        codAvailable: data.codAvailable ?? true,
      },
    });
  }
}
