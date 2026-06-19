import { PrismaClient } from '@prisma/client';
import { PaginationDto, PaginatedResult } from '../utils/pagination.util';

/**
 * Base repository com operações comuns de CRUD com soft-delete e isolamento de tenant.
 * Cada repositório concreto recebe o delegate Prisma correspondente.
 */
export abstract class BaseRepository<T, CreateInput, UpdateInput, WhereInput> {
  constructor(
    protected readonly prisma: PrismaClient,
    protected readonly model: any,
  ) {}

  async findById(id: string, tenantId: string): Promise<T | null> {
    return this.model.findFirst({
      where: { id, tenantId, deletedAt: null } as any,
    });
  }

  async findAll(
    tenantId: string,
    pagination: PaginationDto,
    where?: Partial<WhereInput>,
  ): Promise<PaginatedResult<T>> {
    const { page, limit, orderBy, order } = pagination;
    const skip = (page - 1) * limit;

    const baseWhere = { tenantId, deletedAt: null, ...where };

    const [data, total] = await Promise.all([
      this.model.findMany({
        where: baseWhere,
        skip,
        take: limit,
        orderBy: orderBy ? { [orderBy]: order ?? 'desc' } : { createdAt: 'desc' },
      }),
      this.model.count({ where: baseWhere }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  async create(data: CreateInput): Promise<T> {
    return this.model.create({ data });
  }

  async update(id: string, tenantId: string, data: UpdateInput): Promise<T> {
    return this.model.update({
      where: { id },
      data: { ...data, tenantId } as any,
    });
  }

  async softDelete(id: string, tenantId: string): Promise<T> {
    return this.model.update({
      where: { id },
      data: { deletedAt: new Date(), tenantId } as any,
    });
  }

  async hardDelete(id: string, tenantId: string): Promise<T> {
    return this.model.delete({ where: { id, tenantId } as any });
  }

  async count(tenantId: string, where?: Partial<WhereInput>): Promise<number> {
    return this.model.count({ where: { tenantId, deletedAt: null, ...where } });
  }

  async exists(id: string, tenantId: string): Promise<boolean> {
    const count = await this.model.count({ where: { id, tenantId, deletedAt: null } });
    return count > 0;
  }
}
