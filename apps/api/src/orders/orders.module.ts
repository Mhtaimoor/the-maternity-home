import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { CartModule } from '../cart/cart.module';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  imports: [CartModule],
  controllers: [OrdersController],
  providers: [OrdersService, AuditService, NotificationsService],
  exports: [OrdersService],
})
export class OrdersModule {}
