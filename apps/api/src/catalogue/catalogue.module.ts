import { Module } from '@nestjs/common';
import { CatalogueController } from './catalogue.controller';
import { CatalogueService } from './catalogue.service';
import { AuditService } from '../audit/audit.service';

@Module({
  controllers: [CatalogueController],
  providers: [CatalogueService, AuditService],
  exports: [CatalogueService],
})
export class CatalogueModule {}
