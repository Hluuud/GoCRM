import {
  Controller,
  Post,
  Get,
  Body,
  Request,
  Response,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Request as Req, Response as Res } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  VerifyEmailDto,
} from '../../dtos/login.dto';
import { RegisterDto as RegisterDtoFull } from '../../dtos/register.dto';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Public } from '../../decorators/public.decorator';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @Throttle({ short: { limit: 3, ttl: 60000 } })
  @ApiOperation({ summary: 'Registrar nova conta e organização' })
  @ApiResponse({ status: 201, description: 'Conta criada. Verifique seu email.' })
  @ApiResponse({ status: 409, description: 'Email ou organização já existente.' })
  async register(@Body() dto: RegisterDtoFull, @Request() req: Req) {
    return this.authService.register(dto, req);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Login com email e senha (+ MFA opcional)' })
  @ApiResponse({ status: 200, description: 'Login bem-sucedido. Cookies setados.' })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
  @ApiResponse({ status: 403, description: 'Conta bloqueada por brute-force.' })
  async login(
    @Body() dto: LoginDto,
    @Request() req: Req,
    @Response({ passthrough: true }) res: Res,
  ) {
    return this.authService.login(dto, req, res);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout — revoga sessão e limpa cookies' })
  async logout(
    @Request() req: Req,
    @Response({ passthrough: true }) res: Res,
  ) {
    return this.authService.logout(req, res);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Renovar access token via refresh token (cookie rotation)' })
  @ApiResponse({ status: 200, description: 'Tokens renovados.' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido ou expirado.' })
  async refresh(
    @Request() req: Req,
    @Response({ passthrough: true }) res: Res,
  ) {
    return this.authService.refresh(req, res);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter dados do usuário autenticado' })
  async me(@Request() req: any) {
    return { user: req.user };
  }
}
