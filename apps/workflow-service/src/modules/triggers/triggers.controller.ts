import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TriggersService, TriggerType } from './triggers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IsString, IsIn, IsObject, IsOptional } from 'class-validator';

class RegisterTriggerDto {
  @IsIn([
    'lead.created',
    'lead.status_changed',
    'deal.closed_won',
    'deal.closed_lost',
    'deal.stage_changed',
    'invoice.overdue',
    'task.due_soon',
    'contact.inactivity',
  ])
  type: TriggerType;

  @IsString()
  automationId: string;

  @IsObject()
  @IsOptional()
  conditions?: Record<string, unknown>;
}

@Controller('triggers')
@UseGuards(JwtAuthGuard)
export class TriggersController {
  constructor(private readonly triggersService: TriggersService) {}

  @Get()
  listTriggers(@Request() req) {
    return this.triggersService.listByTenant(req.user.tenantId);
  }

  @Post()
  registerTrigger(@Body() dto: RegisterTriggerDto, @Request() req) {
    return this.triggersService.registerTrigger(
      req.user.tenantId,
      dto.type,
      dto.conditions ?? {},
      dto.automationId,
    );
  }

  @Delete(':id')
  deactivateTrigger(@Param('id') id: string, @Request() req) {
    return this.triggersService.deactivate(id, req.user.tenantId);
  }
}
