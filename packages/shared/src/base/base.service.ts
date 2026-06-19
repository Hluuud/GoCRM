import { NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PaginationDto, PaginatedResult } from '../utils/pagination.util';

export abstract class BaseService<T, CreateDto, UpdateDto> {
  protected readonly logger: Logger;

  constructor(protected readonly serviceName: string) {
    this.logger = new Logger(serviceName);
  }

  protected throwIfNotFound(entity: T | null, resourceName: string, id: string): T {
    if (!entity) {
      throw new NotFoundException(`${resourceName} '${id}' não encontrado.`);
    }
    return entity;
  }

  protected throwIfForbidden(condition: boolean, message?: string): void {
    if (condition) {
      throw new ForbiddenException(message ?? 'Acesso negado.');
    }
  }

  protected buildSearchWhere(search: string | undefined, fields: string[]): Record<string, unknown> {
    if (!search || search.trim() === '') return {};
    return {
      OR: fields.map((field) => ({
        [field]: { contains: search, mode: 'insensitive' },
      })),
    };
  }
}
