import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('NotificationService');

  // Hybrid: HTTP for health + RabbitMQ microservice for event consumption
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL ?? 'amqp://nexcrm:nexcrm@localhost:5672'],
      queue: 'notification_queue',
      noAck: false,
      queueOptions: {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'notification_dlx',
          'x-dead-letter-routing-key': 'notification_dlq',
        },
      },
      prefetchCount: 5,
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3004);
  logger.log(`Notification Service running on port ${process.env.PORT ?? 3004}`);
}

bootstrap();
