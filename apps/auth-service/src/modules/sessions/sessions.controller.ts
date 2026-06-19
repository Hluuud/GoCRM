import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@ApiTags('Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'sessions', version: '1' })
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todas as sessões ativas do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de sessões ativas retornada.' })
  async listSessions(@Request() req: any) {
    return this.sessionsService.getUserSessions(req.user.id);
  }

  @Delete(':sessionId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revogar uma sessão específica' })
  @ApiResponse({ status: 204, description: 'Sessão revogada com sucesso.' })
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @Request() req: any,
  ) {
    // Valida que a sessão pertence ao usuário antes de revogar
    const session = await this.sessionsService.getSession(sessionId);
    if (session?.userId !== req.user.id) {
      return;
    }
    await this.sessionsService.revokeSession(sessionId);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revogar todas as outras sessões (exceto a atual)' })
  async revokeAllOtherSessions(@Request() req: any) {
    await this.sessionsService.revokeAllUserSessions(
      req.user.id,
      req.cookies?.['session_id'],
    );
  }
}
