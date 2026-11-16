import { Role } from '../common/constants';
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller()
export class DeliveryController {
  constructor(private delivery: DeliveryService) {}

  @Get('delivery/zones')
  publicZones() {
    return this.delivery.listPublic();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get('admin/delivery/zones')
  adminZones() {
    return this.delivery.list();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Post('admin/delivery/zones')
  upsert(@Body() body: any) {
    return this.delivery.upsert(body);
  }
}



