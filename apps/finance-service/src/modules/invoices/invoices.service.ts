import { Injectable } from '@nestjs/common';
import { InvoicesRepository } from './invoices.repository';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceStatus } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private readonly repo: InvoicesRepository) {}

  create(tenantId: string, userId: string, dto: CreateInvoiceDto) {
    return this.repo.create(tenantId, userId, dto);
  }

  findAll(tenantId: string, filters: { status?: InvoiceStatus; contactId?: string; search?: string; page?: number; limit?: number }) {
    return this.repo.findAll(tenantId, filters);
  }

  findById(tenantId: string, id: string) {
    return this.repo.findById(tenantId, id);
  }

  update(tenantId: string, id: string, dto: UpdateInvoiceDto) {
    return this.repo.update(tenantId, id, dto);
  }

  markAsPaid(tenantId: string, id: string) {
    return this.repo.markAsPaid(tenantId, id);
  }

  remove(tenantId: string, id: string) {
    return this.repo.softDelete(tenantId, id);
  }

  getRevenueSummary(tenantId: string) {
    return this.repo.getRevenueSummary(tenantId);
  }
}
