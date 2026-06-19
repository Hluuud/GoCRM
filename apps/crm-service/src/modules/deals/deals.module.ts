import { Module } from '@nestjs/common';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { DealsRepository } from './deals.repository';
import { DealsEventListener } from './deals.events';

@Module({
  controllers: [DealsController],
  providers: [DealsService, DealsRepository, DealsEventListener],
  exports: [DealsService],
})
export class DealsModule {}
