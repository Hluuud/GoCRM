import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TasksRepository, CreateTaskDto } from './tasks.repository';
import { TaskStatus } from '@nexcrm/database';

@Injectable()
export class TasksService {
  constructor(
    private readonly repo: TasksRepository,
    private readonly events: EventEmitter2,
  ) {}

  findAll(tenantId: string, page: number, limit: number, status?: TaskStatus, assignedToId?: string) {
    return this.repo.findAll(tenantId, page, limit, status, assignedToId);
  }

  async findById(id: string, tenantId: string) {
    const task = await this.repo.findById(id, tenantId);
    if (!task) throw new NotFoundException(`Tarefa ${id} não encontrada.`);
    return task;
  }

  async create(tenantId: string, userId: string, dto: CreateTaskDto) {
    const task = await this.repo.create(tenantId, userId, dto);
    this.events.emit('task.created', { task, tenantId, userId });
    return task;
  }

  async update(id: string, tenantId: string, userId: string, dto: Partial<CreateTaskDto>) {
    await this.findById(id, tenantId);
    const completedAt =
      dto.status === TaskStatus.DONE ? new Date() : undefined;
    const updated = await this.repo.update(id, { ...dto, ...(completedAt ? { completedAt } : {}) });
    if (dto.status === TaskStatus.DONE) {
      this.events.emit('task.completed', { task: updated, tenantId, userId });
    }
    return updated;
  }

  async remove(id: string, tenantId: string, userId: string) {
    await this.findById(id, tenantId);
    await this.repo.softDelete(id);
    this.events.emit('task.deleted', { taskId: id, tenantId, userId });
  }
}
