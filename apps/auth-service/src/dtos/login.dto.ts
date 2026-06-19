import { IsEmail, IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'rafael@nexcrm.com' })
  @IsEmail({}, { message: 'Email inválido.' })
  email: string;

  @ApiProperty({ example: 'Senha@2024!' })
  @IsString()
  password: string;

  @ApiPropertyOptional({ description: 'Código TOTP de 6 dígitos para MFA', example: '123456' })
  @IsOptional()
  @IsString()
  mfaCode?: string;

  @ApiPropertyOptional({ description: 'Fingerprint do dispositivo para tracking de sessão' })
  @IsOptional()
  @IsString()
  deviceFingerprint?: string;

  @ApiPropertyOptional({ default: false, description: 'Manter sessão por 7 dias' })
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

export class RefreshTokenDto {
  @ApiPropertyOptional({ description: 'Refresh token (necessário apenas em contexto sem cookie)' })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ example: 'rafael@nexcrm.com' })
  @IsEmail({}, { message: 'Email inválido.' })
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token de reset recebido por email' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NovaSenha@2024!', minLength: 8 })
  @IsString()
  newPassword: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Senha atual' })
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NovaSenha@2024!', minLength: 8 })
  @IsString()
  newPassword: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'Token de verificação recebido por email' })
  @IsString()
  token: string;
}
