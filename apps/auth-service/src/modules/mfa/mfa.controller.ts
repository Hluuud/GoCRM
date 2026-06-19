import {
  Controller,
  Post,
  Delete,
  Get,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MfaService } from './mfa.service';
import { UsersRepository } from '../users/users.repository';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

class VerifyMfaDto {
  @ApiProperty({ example: '123456', description: 'Código TOTP de 6 dígitos' })
  @IsString()
  @Length(6, 6)
  code: string;
}

@ApiTags('MFA')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'mfa', version: '1' })
export class MfaController {
  constructor(
    private readonly mfaService: MfaService,
    private readonly usersRepository: UsersRepository,
  ) {}

  @Get('setup')
  @ApiOperation({ summary: 'Iniciar setup de MFA — gera QR Code TOTP' })
  @ApiResponse({ status: 200, description: 'QR Code e secret retornados.' })
  async setupMfa(@Request() req: any) {
    const user = await this.usersRepository.findById(req.user.id);
    if (user.mfaEnabled) {
      throw new BadRequestException('MFA já está habilitado para esta conta.');
    }
    const { secret, otpauth } = this.mfaService.generateSecret(user.email);
    const qrCode = await this.mfaService.generateQrCodeDataUrl(otpauth);
    // Secret temporariamente em cache (em produção, usar Redis com TTL de 10 min)
    return {
      secret,
      qrCode,
      message: 'Escaneie o QR Code com seu app autenticador e confirme com o código.',
    };
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirmar e ativar MFA com código TOTP' })
  async verifyAndEnable(@Body() dto: VerifyMfaDto, @Request() req: any) {
    // Em produção, o secret seria lido do Redis (setup temporário)
    // Aqui assumimos que o secret vem no body para fins de demonstração
    throw new BadRequestException(
      'Em produção: recupere o secret do Redis e chame usersRepository.enableMfa()',
    );
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar MFA' })
  async disableMfa(@Body() dto: VerifyMfaDto, @Request() req: any) {
    const user = await this.usersRepository.findById(req.user.id);
    if (!user.mfaEnabled) {
      throw new BadRequestException('MFA não está habilitado.');
    }
    const isValid = this.mfaService.verifyToken(user.mfaSecret!, dto.code);
    if (!isValid) {
      throw new ForbiddenException('Código MFA inválido.');
    }
    await this.usersRepository.disableMfa(req.user.id);
  }
}
