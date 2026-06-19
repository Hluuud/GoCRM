import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
      ],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('CRM database connected');

    // Soft-delete middleware
    this.$use(async (params, next) => {
      const softDeleteModels = ['Lead', 'Contact', 'Company', 'Deal', 'Task'];

      if (params.model && softDeleteModels.includes(params.model)) {
        if (['findMany', 'findFirst', 'count', 'findUnique'].includes(params.action)) {
          params.args = params.args ?? {};
          params.args.where = params.args.where ?? {};
          if (params.args.where.deletedAt === undefined) {
            params.args.where.deletedAt = null;
          }
        }
        if (params.action === 'delete') {
          params.action = 'update';
          params.args.data = { deletedAt: new Date() };
        }
        if (params.action === 'deleteMany') {
          params.action = 'updateMany';
          params.args.data = { ...params.args.data, deletedAt: new Date() };
        }
      }
      return next(params);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
