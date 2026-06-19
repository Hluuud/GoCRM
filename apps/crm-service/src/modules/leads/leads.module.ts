import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { LeadsRepository } from './leads.repository';
import { LeadsEventListener } from './leads.events';

@Module({
  controllers: [LeadsController],
  providers: [LeadsService, LeadsRepository, LeadsEventListener],
  exports: [LeadsService],
})
export class LeadsModule {}
