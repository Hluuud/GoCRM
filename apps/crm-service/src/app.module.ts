import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import configuration from './config/configuration';
import { DatabaseModule } from './modules/database/database.module';
import { LeadsModule } from './modules/leads/leads.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { DealsModule } from './modules/deals/deals.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { HealthModule } from './modules/health/health.module';
import { RabbitMQModule } from './modules/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration], cache: true }),
    EventEmitterModule.forRoot({ wildcard: true, delimiter: '.' }),
    DatabaseModule,
    RabbitMQModule,
    LeadsModule,
    ContactsModule,
    CompaniesModule,
    DealsModule,
    TasksModule,
    HealthModule,
  ],
})
export class AppModule {}
