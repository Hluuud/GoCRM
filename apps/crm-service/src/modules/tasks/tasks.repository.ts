import { Injectable } from '@nestjs/common';
import { PrismaClient, TaskStatus, TaskPriority, Prisma } from '@nexcrm/database';

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  leadId?: string;
  dealId?: string;
  contactId?: string;
  assignedToId?: string;
}

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(tenantId: string, page = 1, limit = 20, status?: TaskStatus, assignedToId?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.TaskWhereInput = {
      tenantId, deletedAt: null,
      ...(status ? { status } : {}),
      ...(assignedToId ? { assignedToId } : {}),
    };
    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where, skip, take: limit,
        orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        include: {
          assignedTo: { select: { id: true, name: true } },
          lead: { select: { id: true, name: true } },
          deal: { select: { id: true, title: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findById(id: string, tenantId: string) {
    return this.prisma.task.findFirst({ where: { id, tenantId, deletedAt: null } });
  }

  async create(tenantId: string, createdById: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: { ...dto, tenantId, createdById, assignedToId: dto.assignedToId ?? createdById },
    });
  }

  async update(id: string, data: Partial<CreateTaskDto> & { completedAt?: Date | null }) {
    return this.prisma.task.update({ where: { id }, data: { ...data, updatedAt: new Date() } });
  }

  async softDelete(id: string) {
    return this.prisma.task.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
