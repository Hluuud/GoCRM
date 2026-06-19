import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class DealsEventListener {
  private readonly logger = new Logger(DealsEventListener.name);
  constructor(private readonly rabbitmq: RabbitMQService) {}

  @OnEvent('deal.won')
  async onDealWon(payload: { deal: any; tenantId: string; userId: string }) {
    this.logger.log(`Deal ganho: ${payload.deal.id} | Valor: ${payload.deal.value}`);
    await this.rabbitmq.publish('nexcrm.crm', 'deal.won', {
      eventId: crypto.randomUUID(),
      eventType: 'deal.won',
      tenantId: payload.tenantId,
      userId: payload.userId,
      timestamp: new Date().toISOString(),
      data: {
        dealId: payload.deal.id,
        title: payload.deal.title,
        value: payload.deal.value,
        currency: payload.deal.currency,
      },
    });
  }

  @OnEvent('deal.created')
  async onDealCreated(payload: any) {
    await this.rabbitmq.publish('nexcrm.crm', 'deal.created', {
      eventId: crypto.randomUUID(),
      eventType: 'deal.created',
      tenantId: payload.tenantId,
      timestamp: new Date().toISOString(),
      data: { dealId: payload.deal.id, title: payload.deal.title, value: payload.deal.value },
    });
  }
}
