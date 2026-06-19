import { Injectable } from '@nestjs/common';
import { PrismaClient, DealStage, Prisma } from '@nexcrm/database';

export interface CreateDealDto {
  title: string;
  contactId?: string;
  companyId?: string;
  value?: number;
  currency?: string;
  stage?: DealStage;
  probability?: number;
  expectedCloseDate?: Date;
  notes?: string;
  assignedToId?: string;
}

@Injectable()
export class DealsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(tenantId: string, page = 1, limit = 20, stage?: DealStage) {
    const skip = (page - 1) * limit;
    const where: Prisma.DealWhereInput = {
      tenantId, deletedAt: null,
      ...(stage ? { stage } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.deal.findMany({
        where, skip, take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          contact: { select: { id: true, name: true } },
          company: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      }),
      this.prisma.deal.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByStage(tenantId: string): Promise<Record<DealStage, { count: number; totalValue: number }>> {
    const results = await this.prisma.deal.groupBy({
      by: ['stage'],
      where: { tenantId, deletedAt: null },
      _count: { _all: true },
      _sum: { value: true },
    });

    const summary = Object.values(DealStage).reduce((acc, stage) => ({
      ...acc,
      [stage]: { count: 0, totalValue: 0 },
    }), {} as Record<DealStage, { count: number; totalValue: number }>);

    results.forEach(r => {
      summary[r.stage] = { count: r._count._all, totalValue: r._sum.value ?? 0 };
    });

    return summary;
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.deal.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        contact: true, company: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        tasks: { where: { deletedAt: null } },
      },
    });
  }

  async create(tenantId: string, createdById: string, dto: CreateDealDto) {
    return this.prisma.deal.create({
      data: { ...dto, tenantId, createdById, assignedToId: dto.assignedToId ?? createdById },
    });
  }

  async update(id: string, data: Partial<CreateDealDto>) {
    return this.prisma.deal.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  }

  async softDelete(id: string) {
    return this.prisma.deal.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
