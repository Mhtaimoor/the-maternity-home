import { Role, ProductStatus } from '../common/constants';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CatalogueService } from './catalogue.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';

@Controller()
export class CatalogueController {
  constructor(private catalogue: CatalogueService) {}

  @Get('categories')
  listPublicCategories() {
    return this.catalogue.listCategories(false);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.CONTENT_MANAGER, Role.ORDER_STAFF)
  @Get('admin/categories')
  listAdminCategories() {
    return this.catalogue.listCategories(true);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.CONTENT_MANAGER)
  @Post('admin/categories')
  upsertCategory(
    @CurrentUser() user: { id: string },
    @Body()
    body: {
      id?: string;
      name: string;
      description?: string;
      sortOrder?: number;
      active?: boolean;
      imageUrl?: string;
    },
  ) {
    return this.catalogue.upsertCategory(body, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.CONTENT_MANAGER)
  @Delete('admin/categories/:id')
  deleteCategory(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.catalogue.deleteCategory(id, user.id);
  }

  @Get('products')
  listPublicProducts(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('sort') sort?: string,
    @Query('featured') featured?: string,
  ) {
    return this.catalogue.listProducts({
      q,
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sort,
      featured: featured === 'true',
      publicOnly: true,
    });
  }

  @Get('products/:idOrSlug')
  getPublicProduct(@Param('idOrSlug') idOrSlug: string) {
    return this.catalogue.getProduct(idOrSlug, true);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ORDER_STAFF, Role.CONTENT_MANAGER)
  @Get('admin/products')
  listAdminProducts(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('status') status?: ProductStatus,
  ) {
    return this.catalogue.listProducts({ q, category, status, publicOnly: false });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.CONTENT_MANAGER)
  @Post('admin/products')
  createProduct(@CurrentUser() user: { id: string }, @Body() body: any) {
    return this.catalogue.createProduct(body, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.CONTENT_MANAGER)
  @Patch('admin/products/:id')
  updateProduct(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.catalogue.updateProduct(id, body, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.CONTENT_MANAGER)
  @Delete('admin/products/:id')
  deleteProduct(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.catalogue.deleteProduct(id, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ORDER_STAFF)
  @Post('admin/inventory/adjust')
  adjustStock(
    @CurrentUser() user: { id: string },
    @Body() body: { productId: string; variantId: string; delta: number; reason: string },
  ) {
    return this.catalogue.adjustStock(body, user.id);
  }
}



