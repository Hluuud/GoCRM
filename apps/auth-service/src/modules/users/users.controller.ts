import {
  Controller,
  Get,
  Patch,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UsersRepository } from './users.repository';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Rafael Mendes' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: 'America/Sao_Paulo' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private readonly usersRepository: UsersRepository) {}

  @Get('me')
  @ApiOperation({ summary: 'Perfil do usuário autenticado' })
  async profile(@Request() req: any) {
    const user = await this.usersRepository.findById(req.user.id);
    const { passwordHash, mfaSecret, ...safeUser } = user as any;
    return safeUser;
  }
}
