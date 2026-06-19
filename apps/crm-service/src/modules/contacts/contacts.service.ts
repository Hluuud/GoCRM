import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContactsRepository, CreateContactDto } from './contacts.repository';

@Injectable()
export class ContactsService {
  constructor(
    private readonly repo: ContactsRepository,
    private readonly events: EventEmitter2,
  ) {}

  findAll(tenantId: string, page: number, limit: number, search?: string) {
    return this.repo.findAll(tenantId, page, limit, search);
  }

  async findById(id: string, tenantId: string) {
    const contact = await this.repo.findById(id, tenantId);
    if (!contact) throw new NotFoundException(`Contato ${id} não encontrado.`);
    return contact;
  }

  async create(tenantId: string, userId: string, dto: CreateContactDto) {
    const contact = await this.repo.create(tenantId, userId, dto);
    this.events.emit('contact.created', { contact, tenantId, userId });
    return contact;
  }

  async update(id: string, tenantId: string, userId: string, dto: Partial<CreateContactDto>) {
    await this.findById(id, tenantId);
    const updated = await this.repo.update(id, dto);
    this.events.emit('contact.updated', { contact: updated, tenantId, userId });
    return updated;
  }

  async remove(id: string, tenantId: string, userId: string) {
    await this.findById(id, tenantId);
    await this.repo.softDelete(id);
    this.events.emit('contact.deleted', { contactId: id, tenantId, userId });
  }
}
