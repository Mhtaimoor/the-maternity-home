import { Role } from '../common/constants';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { ContentService } from './content.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller()
export class ContentController {
  constructor(private content: ContentService) {}

  @Get('content/pages')
  pages() {
    return this.content.listPages();
  }

  @Get('content/pages/:slug')
  page(@Param('slug') slug: string) {
    return this.content.getPage(slug);
  }

  @Get('content/banners')
  banners() {
    return this.content.listBanners(true);
  }

  @Get('content/settings')
  settings() {
    return this.content.getSettings();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.CONTENT_MANAGER)
  @Post('admin/content/pages')
  upsertPage(@Body() body: { slug: string; title: string; body: string }) {
    return this.content.upsertPage(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.CONTENT_MANAGER)
  @Post('admin/content/banners')
  upsertBanner(@Body() body: any) {
    return this.content.upsertBanner(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post('admin/content/settings')
  setSettings(@Body() body: Record<string, unknown>) {
    return this.content.setSettings(body);
  }
}



