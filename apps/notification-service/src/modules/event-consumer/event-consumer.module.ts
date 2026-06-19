import { Module } from '@nestjs/common';
import { EventConsumerService } from './event-consumer.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  providers: [EventConsumerService],
})
export class EventConsumerModule {}
