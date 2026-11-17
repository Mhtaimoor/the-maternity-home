import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private prisma: PrismaService) {}

  async send(input: {
    channel: 'email' | 'sms' | 'whatsapp' | 'log';
    to: string;
    subject?: string;
    body: string;
    meta?: Record<string, unknown>;
  }) {
    this.logger.log(`[${input.channel}] to=${input.to} subject=${input.subject ?? ''} :: ${input.body}`);
    return this.prisma.notificationLog.create({
      data: {
        channel: input.channel,
        to: input.to,
        subject: input.subject,
        body: input.body,
        meta: input.meta ? JSON.stringify(input.meta) : null,
      },
    });
  }

  async orderPlaced(order: {
    orderNumber: string;
    customerPhone: string;
    customerEmail?: string | null;
    total: number;
    paymentMethod: string;
  }) {
    const body = `Order ${order.orderNumber} placed. Total PKR ${order.total}. Payment: ${order.paymentMethod}. We will confirm shortly.`;
    await this.send({ channel: 'log', to: order.customerPhone, subject: 'Order placed', body });
    if (order.customerEmail) {
      await this.send({
        channel: 'email',
        to: order.customerEmail,
        subject: `Order ${order.orderNumber} received`,
        body,
      });
    }
  }

  async statusUpdate(order: {
    orderNumber: string;
    customerPhone: string;
    customerEmail?: string | null;
    status: string;
    trackingNumber?: string | null;
    courierName?: string | null;
  }) {
    let body = `Order ${order.orderNumber} is now ${order.status}.`;
    if (order.trackingNumber) {
      body += ` Courier: ${order.courierName ?? 'N/A'}, tracking: ${order.trackingNumber}.`;
    }
    await this.send({ channel: 'log', to: order.customerPhone, subject: 'Order update', body });
    if (order.customerEmail) {
      await this.send({
        channel: 'email',
        to: order.customerEmail,
        subject: `Order ${order.orderNumber} update`,
        body,
      });
    }
  }
}
