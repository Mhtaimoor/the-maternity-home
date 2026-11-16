import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  log(input: {
    actorId?: string;
    action: string;
    entity: string;
    entityId?: string;
    summary: string;
  }) {
    return this.prisma.auditLog.create({ data: input });
  }
}
