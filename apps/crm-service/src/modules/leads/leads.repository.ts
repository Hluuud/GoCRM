import { Injectable } from '@nestjs/common';
import { PrismaClient, LeadStatus, Prisma } from '@nexcrm/database';
import { CreateLeadDto, UpdateLeadDto, LeadQueryDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(tenantId: string, query: LeadQueryDto) {
    const { page = 1, limit = 20, search, status, assignedToId, sortBy = 'createdAt', sortOrder = 'desc' } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      tenantId,
      deletedAt: null,
      ...(status ? { status } : {}),
      ...(assignedToId ? { assignedToId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { company: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.lead.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        tasks: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' } },
      },
    });
  }

  async create(tenantId: string, userId: string, dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        ...dto,
        tenantId,
        createdById: userId,
        assignedToId: dto.assignedToId ?? userId,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: string, tenantId: string, dto: UpdateLeadDto) {
    return this.prisma.lead.update({
      where: { id },
      data: { ...dto, updatedAt: new Date() },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async softDelete(id: string, tenantId: string) {
    return this.prisma.lead.update({
      where: { id },
      data: { deletedAt: new Date(), updatedAt: new Date() },
    });
  }

  async countByStatus(tenantId: string): Promise<Record<LeadStatus, number>> {
    const results = await this.prisma.lead.groupBy({
      by: ['status'],
      where: { tenantId, deletedAt: null },
      _count: { _all: true },
    });

    const counts = Object.values(LeadStatus).reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<LeadStatus, number>,
    );

    results.forEach(r => {
      counts[r.status] = r._count._all;
    });

    return counts;
  }
}
