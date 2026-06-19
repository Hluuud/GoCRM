import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@nexcrm/database';

export interface CreateCompanyDto {
  name: string;
  website?: string;
  industry?: string;
  size?: string;
  country?: string;
  city?: string;
  notes?: string;
  annualRevenue?: number;
}

@Injectable()
export class CompaniesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(tenantId: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.CompanyWhereInput = {
      tenantId,
      deletedAt: null,
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.company.findMany({
        where, skip, take: limit,
        orderBy: { name: 'asc' },
        include: { _count: { select: { contacts: true, deals: true } } },
      }),
      this.prisma.company.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.company.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        contacts: { where: { deletedAt: null } },
        deals: { where: { deletedAt: null } },
      },
    });
  }

  async create(tenantId: string, createdById: string, dto: CreateCompanyDto) {
    return this.prisma.company.create({ data: { ...dto, tenantId, createdById } });
  }

  async update(id: string, data: Partial<CreateCompanyDto>) {
    return this.prisma.company.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  }

  async softDelete(id: string) {
    return this.prisma.company.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
