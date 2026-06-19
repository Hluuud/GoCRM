import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SuggestionsService, SuggestionRequest } from './suggestions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IsString, IsIn, IsNotEmpty } from 'class-validator';

class GetSuggestionsDto {
  @IsIn(['reply', 'followup', 'subject', 'summary'])
  context: 'reply' | 'followup' | 'subject' | 'summary';

  @IsString()
  @IsNotEmpty()
  input: string;
}

@Controller('suggestions')
@UseGuards(JwtAuthGuard)
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Post()
  async getSuggestions(@Body() dto: GetSuggestionsDto, @Request() req) {
    const request: SuggestionRequest = {
      tenantId: req.user.tenantId,
      userId: req.user.sub,
      context: dto.context,
      input: dto.input,
    };

    return this.suggestionsService.getSuggestions(request);
  }
}
