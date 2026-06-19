import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LeadsRepository } from './leads.repository';
import { CreateLeadDto, UpdateLeadDto, LeadQueryDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(
    private readonly repo: LeadsRepository,
    private readonly events: EventEmitter2,
  ) {}

  async findAll(tenantId: string, query: LeadQueryDto) {
    return this.repo.findAll(tenantId, query);
  }

  async findById(id: string, tenantId: string) {
    const lead = await this.repo.findById(id, tenantId);
    if (!lead) throw new NotFoundException(`Lead ${id} não encontrado.`);
    return lead;
  }

  async create(tenantId: string, userId: string, dto: CreateLeadDto) {
    const lead = await this.repo.create(tenantId, userId, dto);
    this.events.emit('lead.created', { lead, tenantId, userId });
    return lead;
  }

  async update(id: string, tenantId: string, userId: string, dto: UpdateLeadDto) {
    await this.findById(id, tenantId); // valida existência e tenant
    const updated = await this.repo.update(id, tenantId, dto);
    this.events.emit('lead.updated', { lead: updated, tenantId, userId, changes: dto });
    return updated;
  }

  async remove(id: string, tenantId: string, userId: string) {
    await this.findById(id, tenantId);
    await this.repo.softDelete(id, tenantId);
    this.events.emit('lead.deleted', { leadId: id, tenantId, userId });
  }

  async getStatusCounts(tenantId: string) {
    return this.repo.countByStatus(tenantId);
  }
}
