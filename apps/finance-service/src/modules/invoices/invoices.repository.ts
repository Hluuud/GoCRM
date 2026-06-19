import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceStatus } from './dto/create-invoice.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InvoicesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, createdBy: string, dto: CreateInvoiceDto) {
    const subtotal = dto.lineItems.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const afterDiscount = lineTotal * (1 - (item.discountPercent ?? 0) / 100);
      return sum + afterDiscount;
    }, 0);

    const taxTotal = dto.lineItems.reduce((sum, item) => {
      const lineTotal = item.quantity * item.unitPrice;
      const afterDiscount = lineTotal * (1 - (item.discountPercent ?? 0) / 100);
      return sum + afterDiscount * ((item.taxPercent ?? 0) / 100);
    }, 0);

    const total = subtotal + taxTotal;

    const invoiceNumber =
      dto.invoiceNumber ?? `INV-${Date.now().toString(36).toUpperCase()}`;

    return this.prisma.invoice.create({
      data: {
        tenantId,
        createdById: createdBy,
        contactId: dto.contactId,
        dealId: dto.dealId,
        invoiceNumber,
        status: dto.status ?? InvoiceStatus.DRAFT,
        issuedAt: new Date(dto.issuedAt),
        dueAt: new Date(dto.dueAt),
        subtotal,
        taxTotal,
        total,
        currency: dto.currency ?? 'BRL',
        notes: dto.notes,
        lineItems: {
          create: dto.lineItems.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discountPercent: item.discountPercent ?? 0,
            taxPercent: item.taxPercent ?? 0,
            total:
              item.quantity *
              item.unitPrice *
              (1 - (item.discountPercent ?? 0) / 100) *
              (1 + (item.taxPercent ?? 0) / 100),
          })),
        },
      },
      include: { lineItems: true, contact: true, deal: true },
    });
  }

  async findAll(
    tenantId: string,
    filters: { status?: InvoiceStatus; contactId?: string; search?: string; page?: number; limit?: number },
  ) {
    const { status, contactId, search, page = 1, limit = 20 } = filters;
    const skip = (page - 1) * limit;

    const where: Prisma.InvoiceWhereInput = {
      tenantId,
      deletedAt: null,
      ...(status && { status }),
      ...(contactId && { contactId }),
      ...(search && {
        OR: [
          { invoiceNumber: { contains: search, mode: 'insensitive' } },
          { contact: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: { contact: true, lineItems: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { lineItems: true, contact: true, deal: true, createdBy: true },
    });
    if (!invoice) throw new NotFoundException(`Invoice ${id} not found`);
    return invoice;
  }

  async update(tenantId: string, id: string, dto: UpdateInvoiceDto) {
    await this.findById(tenantId, id);
    return this.prisma.invoice.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.dueAt && { dueAt: new Date(dto.dueAt) }),
      },
      include: { lineItems: true, contact: true },
    });
  }

  async markAsPaid(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.prisma.invoice.update({
      where: { id },
      data: { status: InvoiceStatus.PAID, paidAt: new Date() },
    });
  }

  async softDelete(tenantId: string, id: string) {
    await this.findById(tenantId, id);
    return this.prisma.invoice.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async getRevenueSummary(tenantId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [paid, sent, overdue] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { tenantId, status: InvoiceStatus.PAID, deletedAt: null },
        _sum: { total: true },
      }),
      this.prisma.invoice.aggregate({
        where: { tenantId, status: InvoiceStatus.SENT, deletedAt: null },
        _sum: { total: true },
      }),
      this.prisma.invoice.aggregate({
        where: { tenantId, status: InvoiceStatus.OVERDUE, deletedAt: null },
        _sum: { total: true },
      }),
    ]);

    const monthlyRevenue = await this.prisma.invoice.groupBy({
      by: ['issuedAt'],
      where: {
        tenantId,
        status: InvoiceStatus.PAID,
        deletedAt: null,
        issuedAt: { gte: new Date(new Date().setMonth(now.getMonth() - 11)) },
      },
      _sum: { total: true },
    });

    return {
      totalPaid: paid._sum.total ?? 0,
      totalReceivable: sent._sum.total ?? 0,
      totalOverdue: overdue._sum.total ?? 0,
      monthlyRevenue,
    };
  }
}
