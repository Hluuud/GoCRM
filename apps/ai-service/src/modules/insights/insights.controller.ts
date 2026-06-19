import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InsightsService, CrmContext } from './insights.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class GenerateInsightsDto implements CrmContext {
  tenantId: string;
  @ApiProperty() @IsNumber() leadsCount: number;
  @ApiProperty() @IsNumber() dealsCount: number;
  @ApiProperty() @IsNumber() conversionRate: number;
  @ApiProperty() @IsNumber() revenue: number;
  @ApiProperty() @IsNumber() overdueInvoices: number;
  @ApiProperty() @IsNumber() openTasks: number;
  @ApiPropertyOptional() @IsOptional() @IsString() topPerformer?: string;
}

@ApiTags('Insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate AI insights from CRM context' })
  generate(@Request() req, @Body() dto: GenerateInsightsDto) {
    return this.insightsService.generateInsights({ ...dto, tenantId: req.user.tenantId });
  }

  @Post('follow-up')
  @ApiOperation({ summary: 'Generate follow-up suggestion for a lead' })
  followUp(
    @Body() body: { name: string; email: string; status: string; lastContact?: string },
  ) {
    return this.insightsService.generateFollowUpSuggestion({
      ...body,
      lastContact: body.lastContact ? new Date(body.lastContact) : undefined,
    });
  }
}
