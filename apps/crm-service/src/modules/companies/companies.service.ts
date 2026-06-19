import { Injectable, NotFoundException } from '@nestjs/common';
import { CompaniesRepository, CreateCompanyDto } from './companies.repository';

@Injectable()
export class CompaniesService {
  constructor(private readonly repo: CompaniesRepository) {}
  findAll(tenantId: string, page: number, limit: number, search?: string) { return this.repo.findAll(tenantId, page, limit, search); }
  async findById(id: string, tenantId: string) {
    const c = await this.repo.findById(id, tenantId);
    if (!c) throw new NotFoundException(`Empresa ${id} não encontrada.`);
    return c;
  }
  async create(tenantId: string, userId: string, dto: CreateCompanyDto) { return this.repo.create(tenantId, userId, dto); }
  async update(id: string, tenantId: string, dto: Partial<CreateCompanyDto>) { await this.findById(id, tenantId); return this.repo.update(id, dto); }
  async remove(id: string, tenantId: string) { await this.findById(id, tenantId); return this.repo.softDelete(id); }
}
