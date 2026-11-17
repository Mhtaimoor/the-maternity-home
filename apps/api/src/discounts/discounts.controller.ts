import { Role } from '../common/constants';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { DiscountsService } from './discounts.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller()
export class DiscountsController {
  constructor(private discounts: DiscountsService) {}

  @Post('coupons/preview')
  preview(@Body() body: { code: string; subtotal: number }) {
    return this.discounts.preview(body.code, body.subtotal);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get('admin/coupons')
  list() {
    return this.discounts.list();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post('admin/coupons')
  upsert(@Body() body: any) {
    return this.discounts.upsert(body);
  }
}



