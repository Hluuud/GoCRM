import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template?: string;
  context?: Record<string, unknown>;
  html?: string;
  text?: string;
  attachments?: { filename: string; content: Buffer | string }[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST', 'smtp.mailtrap.io'),
      port: this.config.get<number>('SMTP_PORT', 587),
      secure: this.config.get<boolean>('SMTP_SECURE', false),
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async send(options: SendEmailOptions): Promise<void> {
    try {
      let html = options.html;

      if (options.template && options.context) {
        const template = handlebars.compile(options.template);
        html = template(options.context);
      }

      await this.transporter.sendMail({
        from: this.config.get('SMTP_FROM', '"NexCRM" <noreply@nexcrm.com>'),
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: options.subject,
        html,
        text: options.text,
        attachments: options.attachments,
      });

      this.logger.log(`Email sent to ${options.to}: ${options.subject}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error.stack);
      throw error;
    }
  }

  async sendLeadCreated(to: string, lead: { name: string; email: string; company?: string }) {
    return this.send({
      to,
      subject: `Novo lead criado: ${lead.name}`,
      html: `
        <h2>Novo Lead no NexCRM</h2>
        <p><strong>Nome:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        ${lead.company ? `<p><strong>Empresa:</strong> ${lead.company}</p>` : ''}
        <p>Acesse o CRM para gerenciar este lead.</p>
      `,
    });
  }

  async sendDealWon(to: string, deal: { title: string; value: number; contact: string }) {
    return this.send({
      to,
      subject: `Deal fechado: ${deal.title}`,
      html: `
        <h2>Negocio Fechado!</h2>
        <p><strong>Deal:</strong> ${deal.title}</p>
        <p><strong>Valor:</strong> R$ ${deal.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        <p><strong>Cliente:</strong> ${deal.contact}</p>
      `,
    });
  }

  async sendInvoiceDue(to: string, invoice: { number: string; dueAt: Date; total: number }) {
    return this.send({
      to,
      subject: `Fatura ${invoice.number} vence em breve`,
      html: `
        <h2>Lembrete de Vencimento</h2>
        <p>A fatura <strong>${invoice.number}</strong> vence em <strong>${invoice.dueAt.toLocaleDateString('pt-BR')}</strong>.</p>
        <p><strong>Valor:</strong> R$ ${invoice.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
      `,
    });
  }
}
