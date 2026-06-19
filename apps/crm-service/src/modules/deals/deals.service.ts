import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DealsRepository, CreateDealDto } from './deals.repository';
import { DealStage } from '@nexcrm/database';

@Injectable()
export class DealsService {
  constructor(
    private readonly repo: DealsRepository,
    private readonly events: EventEmitter2,
  ) {}

  findAll(tenantId: string, page: number, limit: number, stage?: DealStage) {
    return this.repo.findAll(tenantId, page, limit, stage);
  }

  getKanbanBoard(tenantId: string) {
    return this.repo.findByStage(tenantId);
  }

  async findById(id: string, tenantId: string) {
    const deal = await this.repo.findById(id, tenantId);
    if (!deal) throw new NotFoundException(`Deal ${id} não encontrado.`);
    return deal;
  }

  async create(tenantId: string, userId: string, dto: CreateDealDto) {
    const deal = await this.repo.create(tenantId, userId, dto);
    this.events.emit('deal.created', { deal, tenantId, userId });
    return deal;
  }

  async update(id: string, tenantId: string, userId: string, dto: Partial<CreateDealDto>) {
    const before = await this.findById(id, tenantId);
    const updated = await this.repo.update(id, dto);
    // Emite evento especial se o deal foi ganho
    if (dto.stage === DealStage.WON && before.stage !== DealStage.WON) {
      this.events.emit('deal.won', { deal: updated, tenantId, userId });
    }
    this.events.emit('deal.updated', { deal: updated, tenantId, userId });
    return updated;
  }

  async remove(id: string, tenantId: string, userId: string) {
    await this.findById(id, tenantId);
    await this.repo.softDelete(id);
    this.events.emit('deal.deleted', { dealId: id, tenantId, userId });
  }
}
