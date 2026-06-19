import { Injectable, Logger } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { EmailService } from '../email/email.service';

@Injectable()
export class EventConsumerService {
  private readonly logger = new Logger(EventConsumerService.name);

  constructor(private readonly emailService: EmailService) {}

  @EventPattern('lead.created')
  async handleLeadCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      this.logger.log(`[lead.created] Processing lead: ${data.lead?.id}`);
      if (data.assignedTo?.email) {
        await this.emailService.sendLeadCreated(data.assignedTo.email, {
          name: data.lead.name,
          email: data.lead.email,
          company: data.lead.company,
        });
      }
      channel.ack(message);
    } catch (error) {
      this.logger.error('[lead.created] Failed', error.stack);
      channel.nack(message, false, false); // send to DLQ
    }
  }

  @EventPattern('deal.won')
  async handleDealWon(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      this.logger.log(`[deal.won] Processing deal: ${data.deal?.id}`);
      if (data.owner?.email) {
        await this.emailService.sendDealWon(data.owner.email, {
          title: data.deal.title,
          value: data.deal.value,
          contact: data.deal.contact?.name ?? 'N/A',
        });
      }
      channel.ack(message);
    } catch (error) {
      this.logger.error('[deal.won] Failed', error.stack);
      channel.nack(message, false, false);
    }
  }

  @EventPattern('invoice.overdue')
  async handleInvoiceOverdue(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const message = context.getMessage();
    try {
      this.logger.log(`[invoice.overdue] Processing invoice: ${data.invoice?.id}`);
      if (data.contact?.email) {
        await this.emailService.sendInvoiceDue(data.contact.email, {
          number: data.invoice.invoiceNumber,
          dueAt: new Date(data.invoice.dueAt),
          total: data.invoice.total,
        });
      }
      channel.ack(message);
    } catch (error) {
      this.logger.error('[invoice.overdue] Failed', error.stack);
      channel.nack(message, false, false);
    }
  }
}
