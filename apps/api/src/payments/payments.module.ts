import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { NotificationsService } from '../notifications/notifications.service';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, NotificationsService],
})
export class PaymentsModule {}
