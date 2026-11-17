import { Body, Controller, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private payments: PaymentsService) {}

  @Post('mock/checkout/:orderId')
  mockCheckout(@Param('orderId') orderId: string) {
    return this.payments.createMockCheckout(orderId);
  }

  @Post('mock/webhook')
  mockWebhook(@Body() body: { reference: string; status: 'PAID' | 'FAILED' }) {
    return this.payments.mockWebhook(body);
  }
}
