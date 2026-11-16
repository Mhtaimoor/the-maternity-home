import { Role } from '../common/constants';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.OWNER, Role.ORDER_STAFF)
export class ReportsController {
  constructor(private reports: ReportsService) {}

  @Get('dashboard')
  dashboard() {
    return this.reports.dashboard();
  }

  @Get('sales')
  sales(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reports.salesByDate(from, to);
  }

  @Get('orders-by-status')
  byStatus() {
    return this.reports.ordersByStatus();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.OWNER)
  @Get('stock-valuation')
  stock() {
    return this.reports.stockValuation();
  }
}



