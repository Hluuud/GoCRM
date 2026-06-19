import { Module } from '@nestjs/common';
import { TriggersService } from './triggers.service';
import { TriggersController } from './triggers.controller';
import { AutomationModule } from '../automation/automation.module';

@Module({
  imports: [AutomationModule],
  controllers: [TriggersController],
  providers: [TriggersService],
  exports: [TriggersService],
})
export class TriggersModule {}
