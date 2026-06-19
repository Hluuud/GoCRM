import { Injectable } from '@nestjs/common';
import { PrismaClient, Prisma } from '@nexcrm/database';

export interface CreateContactDto {
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  companyId?: string;
  notes?: string;
  tags?: string[];
}

@Injectable()
export class ContactsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(tenantId: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.ContactWhereInput = {
      tenantId,
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, name: true } },
        },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.contact.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        company: true,
        deals: { where: { deletedAt: null } },
        tasks: { where: { deletedAt: null }, orderBy: { dueDate: 'asc' } },
      },
    });
  }

  async create(tenantId: string, createdById: string, dto: CreateContactDto) {
    return this.prisma.contact.create({
      data: { ...dto, tenantId, createdById },
      include: { company: { select: { id: true, name: true } } },
    });
  }

  async update(id: string, data: Partial<CreateContactDto>) {
    return this.prisma.contact.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async softDelete(id: string) {
    return this.prisma.contact.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
