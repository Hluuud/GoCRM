import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InsightsService } from '../insights/insights.service';
import { IsString, IsArray, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class ChatMessageDto {
  @ApiProperty() @IsString() message: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  history?: { role: 'user' | 'assistant'; content: string }[];
}

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly insightsService: InsightsService) {}

  @Post()
  @ApiOperation({ summary: 'Chat with AI assistant' })
  async chat(@Request() req, @Body() dto: ChatMessageDto) {
    const reply = await this.insightsService.chat(
      req.user.tenantId,
      dto.message,
      dto.history ?? [],
    );
    return { reply, timestamp: new Date().toISOString() };
  }
}
