import { Role, OrderStatus, PaymentMethod, PaymentStatus } from '../common/constants';
import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';

import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { CurrentUser } from '../common/current-user.decorator';

@Controller()
export class OrdersController {
  constructor(private orders: OrdersService) {}

  @Post('checkout')
  checkout(
    @Body()
    body: {
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
    },
  ) {
    return this.orders.checkout(body);
  }

  @Post('orders/track')
  track(@Body() body: { orderNumber: string; phone: string }) {
    return this.orders.track(body.orderNumber, body.phone);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ORDER_STAFF)
  @Get('admin/orders')
  list(@Query('status') status?: OrderStatus, @Query('q') q?: string) {
    return this.orders.listAdmin({ status, q });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ORDER_STAFF)
  @Get('admin/orders/:id')
  get(@Param('id') id: string) {
    return this.orders.getAdmin(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ORDER_STAFF)
  @Patch('admin/orders/:id/status')
  updateStatus(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body()
    body: {
      status: OrderStatus;
      cancelReason?: string;
      courierName?: string;
      trackingNumber?: string;
      internalNotes?: string;
    },
  ) {
    return this.orders.updateStatus(id, body, user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER, Role.ORDER_STAFF)
  @Patch('admin/orders/:id/payment')
  markPayment(
    @CurrentUser() user: { id: string; role: string },
    @Param('id') id: string,
    @Body() body: { status: PaymentStatus },
  ) {
    return this.orders.markPayment(id, body.status, user.id, user.role);
  }
}



