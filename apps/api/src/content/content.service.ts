import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  listPages() {
    return this.prisma.contentPage.findMany({ orderBy: { slug: 'asc' } });
  }

  getPage(slug: string) {
    return this.prisma.contentPage.findUnique({ where: { slug } });
  }

  upsertPage(data: { slug: string; title: string; body: string }) {
    return this.prisma.contentPage.upsert({
      where: { slug: data.slug },
      create: data,
      update: { title: data.title, body: data.body },
    });
  }

  listBanners(activeOnly = true) {
    return this.prisma.banner.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  }

  upsertBanner(data: {
    id?: string;
    title: string;
    subtitle?: string;
    imageUrl?: string;
    linkUrl?: string;
    active?: boolean;
    sortOrder?: number;
  }) {
    if (data.id) {
      return this.prisma.banner.update({
        where: { id: data.id },
        data: {
          title: data.title,
          subtitle: data.subtitle,
          imageUrl: data.imageUrl,
          linkUrl: data.linkUrl,
          active: data.active ?? true,
          sortOrder: data.sortOrder ?? 0,
        },
      });
    }
    return this.prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        active: data.active ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  async getSettings() {
    const row = await this.prisma.storeSetting.findUnique({ where: { id: 'default' } });
    return row ? JSON.parse(row.json) : {};
  }

  async setSettings(json: Record<string, unknown>) {
    const row = await this.prisma.storeSetting.upsert({
      where: { id: 'default' },
      create: { id: 'default', json: JSON.stringify(json) },
      update: { json: JSON.stringify(json) },
    });
    return JSON.parse(row.json);
  }
}
