import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '../common/constants';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

/**
 * Phase 7: mock gateway + webhook stub.
 * Real JazzCash/PayFast/Safepay credentials are not available — document
 * PAYMENT_PROVIDER=mock and swap provider adapters later.
 */
@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async createMockCheckout(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.paymentMethod !== 'GATEWAY') {
      throw new BadRequestException('Order is not a gateway payment');
    }
    const payment = order.payments[0];
    return {
      checkoutUrl: `${process.env.NEXT_PUBLIC_STORE_URL ?? 'http://localhost:3000'}/pay/mock?order=${order.orderNumber}&ref=${payment?.reference}`,
      reference: payment?.reference,
      amount: order.total,
      provider: process.env.PAYMENT_PROVIDER || 'mock',
    };
  }

  async mockWebhook(body: { reference: string; status: 'PAID' | 'FAILED' }) {
    const payment = await this.prisma.payment.findFirst({
      where: { reference: body.reference },
      include: { order: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const status = body.status === 'PAID' ? PaymentStatus.PAID : PaymentStatus.FAILED;
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status,
        paidAt: status === PaymentStatus.PAID ? new Date() : null,
        rawPayload: JSON.stringify(body),
      },
    });
    const order = await this.prisma.order.update({
      where: { id: payment.orderId },
      data: { paymentStatus: status },
    });
    if (status === PaymentStatus.PAID) {
      await this.notifications.statusUpdate({
        ...order,
        status: `PAYMENT_${status}`,
      });
    }
    return { ok: true, orderNumber: order.orderNumber, paymentStatus: status };
  }
}



