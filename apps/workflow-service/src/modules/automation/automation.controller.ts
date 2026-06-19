import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AutomationService, TriggerEvent, AutomationRule } from './automation.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Automation')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('rules')
  @ApiOperation({ summary: 'Register an automation rule' })
  registerRule(@Request() req, @Body() rule: Omit<AutomationRule, 'executionCount' | 'lastExecutedAt'>) {
    return this.automationService.registerRule({ ...rule, tenantId: req.user.tenantId, executionCount: 0 });
  }

  @Post('trigger')
  @ApiOperation({ summary: 'Manually trigger a workflow event' })
  trigger(
    @Request() req,
    @Body() body: { event: TriggerEvent; payload: Record<string, unknown> },
  ) {
    return this.automationService.triggerEvent(req.user.tenantId, body.event, body.payload);
  }
}
