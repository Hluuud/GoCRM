import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'Rafael Mendes', description: 'Nome completo' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'rafael@nexcrm.com', description: 'Email corporativo' })
  @IsEmail({}, { message: 'Email inválido.' })
  email: string;

  @ApiProperty({
    example: 'Senha@2024!',
    description: 'Senha: mín. 8 caracteres, 1 maiúscula, 1 número, 1 especial',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Senha deve ter no mínimo 8 caracteres.' })
  @MaxLength(128)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, {
    message: 'Senha deve conter ao menos 1 maiúscula, 1 número e 1 caractere especial.',
  })
  password: string;

  @ApiPropertyOptional({ example: 'Advocacia Nunes Ltda', description: 'Nome da organização (cria novo tenant)' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  organizationName?: string;

  @ApiPropertyOptional({ description: 'ID do tenant para ingressar (se não for criar um novo)' })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiPropertyOptional({ example: 'America/Sao_Paulo' })
  @IsOptional()
  @IsString()
  timezone?: string;
}
