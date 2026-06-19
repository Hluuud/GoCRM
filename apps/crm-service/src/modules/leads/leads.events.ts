import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class LeadsEventListener {
  private readonly logger = new Logger(LeadsEventListener.name);

  constructor(private readonly rabbitmq: RabbitMQService) {}

  @OnEvent('lead.created')
  async onLeadCreated(payload: { lead: any; tenantId: string; userId: string }) {
    this.logger.log(`Lead criado: ${payload.lead.id} | Tenant: ${payload.tenantId}`);
    await this.rabbitmq.publish('nexcrm.crm', 'lead.created', {
      eventId: crypto.randomUUID(),
      eventType: 'lead.created',
      tenantId: payload.tenantId,
      userId: payload.userId,
      timestamp: new Date().toISOString(),
      data: {
        leadId: payload.lead.id,
        name: payload.lead.name,
        email: payload.lead.email,
        company: payload.lead.company,
        status: payload.lead.status,
        value: payload.lead.value,
      },
    });
  }

  @OnEvent('lead.updated')
  async onLeadUpdated(payload: { lead: any; tenantId: string; userId: string; changes: any }) {
    this.logger.log(`Lead atualizado: ${payload.lead.id}`);
    await this.rabbitmq.publish('nexcrm.crm', 'lead.updated', {
      eventId: crypto.randomUUID(),
      eventType: 'lead.updated',
      tenantId: payload.tenantId,
      userId: payload.userId,
      timestamp: new Date().toISOString(),
      data: {
        leadId: payload.lead.id,
        changes: payload.changes,
      },
    });
  }

  @OnEvent('lead.deleted')
  async onLeadDeleted(payload: { leadId: string; tenantId: string; userId: string }) {
    this.logger.log(`Lead removido: ${payload.leadId}`);
    await this.rabbitmq.publish('nexcrm.crm', 'lead.deleted', {
      eventId: crypto.randomUUID(),
      eventType: 'lead.deleted',
      tenantId: payload.tenantId,
      userId: payload.userId,
      timestamp: new Date().toISOString(),
      data: { leadId: payload.leadId },
    });
  }
}
