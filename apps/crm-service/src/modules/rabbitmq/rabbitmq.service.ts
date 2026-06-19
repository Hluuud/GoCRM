import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import type { ChannelWrapper } from 'amqp-connection-manager';
import type { Channel, Options } from 'amqplib';

@Injectable()
export class RabbitMQService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection: amqp.AmqpConnectionManager;
  private channelWrapper: ChannelWrapper;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const url = this.config.get<string>('rabbitmq.url', 'amqp://guest:guest@localhost:5672');

    this.connection = amqp.connect([url], {
      reconnectTimeInSeconds: 5,
      heartbeatIntervalInSeconds: 5,
    });

    this.channelWrapper = this.connection.createChannel({
      json: true,
      setup: async (channel: Channel) => {
        // Exchange principal
        await channel.assertExchange('nexcrm.crm', 'topic', { durable: true });
        // Dead-letter exchange
        await channel.assertExchange('nexcrm.crm.dlx', 'topic', { durable: true });
        this.logger.log('RabbitMQ: exchanges configurados.');
      },
    });

    this.connection.on('connect', () => this.logger.log('RabbitMQ: conectado.'));
    this.connection.on('disconnect', ({ err }) =>
      this.logger.warn(`RabbitMQ: desconectado. ${err?.message}`),
    );
  }

  async onModuleDestroy() {
    await this.channelWrapper.close();
    await this.connection.close();
  }

  async publish(
    exchange: string,
    routingKey: string,
    message: object,
    options: Options.Publish = {},
  ): Promise<void> {
    try {
      await this.channelWrapper.publish(exchange, routingKey, message, {
        contentType: 'application/json',
        persistent: true,
        timestamp: Date.now(),
        messageId: crypto.randomUUID(),
        ...options,
      });
    } catch (err) {
      this.logger.error(`Falha ao publicar evento ${routingKey}: ${(err as Error).message}`);
    }
  }
}
