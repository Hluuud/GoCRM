import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@nexcrm/database';
import * as argon2 from 'argon2';
import { RegisterDto } from '../../dtos/register.dto';
import { LoginDto } from '../../dtos/login.dto';
import { SessionsService } from '../sessions/sessions.service';
import { UsersRepository } from '../users/users.repository';
import { MfaService } from '../mfa/mfa.service';
import { Response, Request } from 'express';

@Injectable()
export class AuthService {
  private readonly ACCESS_COOKIE = 'access_token';
  private readonly REFRESH_COOKIE = 'refresh_token';

  constructor(
    private readonly prisma: PrismaClient,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly sessionsService: SessionsService,
    private readonly usersRepository: UsersRepository,
    private readonly mfaService: MfaService,
  ) {}

  // ── Registro ────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto, req: Request) {
    // Verifica duplicação de email
    const existing = await this.usersRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Este email já está em uso.');
    }

    // Cria ou valida tenant
    let tenantId = dto.tenantId;
    let roleId: string;

    if (!tenantId && dto.organizationName) {
      const slug = dto.organizationName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const existingTenant = await this.prisma.tenant.findFirst({ where: { slug } });
      if (existingTenant) {
        throw new ConflictException('Já existe uma organização com este nome.');
      }

      // Cria o tenant e role de admin padrão em transação
      const tenant = await this.prisma.tenant.create({
        data: {
          name: dto.organizationName,
          slug: `${slug}-${Date.now()}`.slice(0, 63),
          plan: 'FREE',
          roles: {
            create: [
              { name: 'Admin', isDefault: false },
              { name: 'Vendedor', isDefault: true },
              { name: 'Visualizador', isDefault: false },
            ],
          },
        },
        include: { roles: true },
      });
      tenantId = tenant.id;
      roleId = tenant.roles.find(r => r.name === 'Admin')!.id;
    } else if (tenantId) {
      const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
      if (!tenant || !tenant.isActive) {
        throw new BadRequestException('Tenant inválido ou inativo.');
      }
      const defaultRole = await this.prisma.role.findFirst({
        where: { tenantId, isDefault: true },
      });
      roleId = defaultRole?.id ?? (await this.prisma.role.findFirst({ where: { tenantId } }))!.id;
    } else {
      throw new BadRequestException('Informe o nome da organização ou o ID do tenant.');
    }

    // Hash da senha com Argon2id
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const user = await this.usersRepository.create({
      name: dto.name,
      email: dto.email,
      passwordHash,
      tenantId: tenantId!,
      roleId,
      timezone: dto.timezone,
    });

    // Audit log
    await this.createAuditLog({
      userId: user.id,
      tenantId: tenantId!,
      action: 'USER_REGISTERED',
      ipAddress: this.getIp(req),
      userAgent: req.headers['user-agent'],
    });

    return { message: 'Conta criada com sucesso. Verifique seu email para ativar.' };
  }

  // ── Login ───────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, req: Request, res: Response) {
    const identifier = dto.email.toLowerCase();

    // Brute-force check
    const maxAttempts = this.config.get<number>('rateLimit.bruteForceMaxAttempts', 5);
    const attempts = await this.sessionsService.getFailedLoginAttempts(identifier);
    if (attempts >= maxAttempts) {
      const ttl = await this.sessionsService.getLockoutTtl(identifier);
      throw new ForbiddenException(
        `Conta bloqueada por excesso de tentativas. Tente novamente em ${Math.ceil(ttl / 60)} minutos.`,
      );
    }

    // Busca usuário
    const user = await this.usersRepository.findByEmail(identifier);
    if (!user || !user.isActive) {
      await this.sessionsService.recordFailedLogin(identifier);
      throw new UnauthorizedException('Email ou senha incorretos.');
    }

    // Verifica senha
    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      await this.sessionsService.recordFailedLogin(identifier);
      throw new UnauthorizedException('Email ou senha incorretos.');
    }

    // MFA check
    if (user.mfaEnabled) {
      if (!dto.mfaCode) {
        throw new UnauthorizedException('Código MFA obrigatório.');
      }
      const isValidMfa = this.mfaService.verifyToken(user.mfaSecret!, dto.mfaCode);
      if (!isValidMfa) {
        await this.sessionsService.recordFailedLogin(identifier);
        throw new UnauthorizedException('Código MFA inválido.');
      }
    }

    // Resolve tenant e roles
    const membership = user.memberships[0];
    if (!membership || !membership.tenant.isActive) {
      throw new ForbiddenException('Nenhum tenant ativo associado a esta conta.');
    }

    const tenantId = membership.tenantId;
    const roles = [membership.role.name];
    const permissions = membership.role.permissions.map(p => p.permission.key);

    // Limpa tentativas falhas
    await this.sessionsService.clearFailedLoginAttempts(identifier);

    // Gera tokens
    const accessToken = this.generateAccessToken({ sub: user.id, email: user.email, tenantId, roles, permissions });
    const refreshToken = this.generateRefreshToken({ sub: user.id, tenantId });

    const rememberMe = dto.rememberMe ?? false;
    const refreshTtlSeconds = rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24;
    const accessTtlSeconds = 60 * 15; // 15 min

    // Armazena refresh token no Redis
    await this.sessionsService.storeRefreshToken(user.id, tenantId, refreshToken, refreshTtlSeconds);

    // Cria sessão
    await this.sessionsService.createSession(
      {
        userId: user.id,
        tenantId,
        email: user.email,
        roles,
        ip: this.getIp(req),
        userAgent: req.headers['user-agent'] ?? '',
        deviceFingerprint: dto.deviceFingerprint,
      },
      refreshTtlSeconds,
    );

    // Seta cookies HttpOnly
    this.setAuthCookies(res, accessToken, refreshToken, rememberMe);

    // Audit log
    await this.createAuditLog({
      userId: user.id,
      tenantId,
      action: 'USER_LOGIN',
      ipAddress: this.getIp(req),
      userAgent: req.headers['user-agent'],
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tenantId,
        roles,
        mfaEnabled: user.mfaEnabled,
      },
    };
  }

  // ── Logout ──────────────────────────────────────────────────────────────────

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.[this.REFRESH_COOKIE];
    if (refreshToken) {
      await this.sessionsService.revokeRefreshToken(refreshToken);
    }
    this.clearAuthCookies(res);
  }

  // ── Refresh ─────────────────────────────────────────────────────────────────

  async refresh(req: Request, res: Response) {
    const oldRefreshToken = req.cookies?.[this.REFRESH_COOKIE];
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token ausente.');
    }

    const tokenData = await this.sessionsService.getRefreshTokenData(oldRefreshToken);
    if (!tokenData) {
      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }

    const user = await this.usersRepository.findById(tokenData.userId);
    const membership = user.memberships.find(m => m.tenantId === tokenData.tenantId);
    if (!membership) throw new UnauthorizedException('Sessão inválida.');

    const roles = [membership.role.name];
    const permissions = membership.role.permissions.map(p => p.permission.key);

    const newAccessToken = this.generateAccessToken({
      sub: user.id,
      email: user.email,
      tenantId: tokenData.tenantId,
      roles,
      permissions,
    });
    const newRefreshToken = this.generateRefreshToken({ sub: user.id, tenantId: tokenData.tenantId });

    await this.sessionsService.rotateRefreshToken(
      oldRefreshToken,
      user.id,
      tokenData.tenantId,
      newRefreshToken,
      60 * 60 * 24 * 7,
    );

    this.setAuthCookies(res, newAccessToken, newRefreshToken, true);

    return { message: 'Tokens renovados com sucesso.' };
  }

  // ── Token helpers ────────────────────────────────────────────────────────────

  private generateAccessToken(payload: object): string {
    return this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn: this.config.get<string>('jwt.accessExpiresIn', '15m'),
    });
  }

  private generateRefreshToken(payload: object): string {
    return this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn', '7d'),
    });
  }

  // ── Cookie helpers ───────────────────────────────────────────────────────────

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string, persistent: boolean) {
    const isSecure = this.config.get<boolean>('cookie.secure', false);
    const sameSite = this.config.get<string>('cookie.sameSite', 'lax') as 'lax' | 'strict' | 'none';
    const domain = this.config.get<string>('cookie.domain', 'localhost');

    res.cookie(this.ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      domain,
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie(this.REFRESH_COOKIE, refreshToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite,
      domain,
      path: '/v1/auth/refresh',
      maxAge: persistent ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000,
    });
  }

  private clearAuthCookies(res: Response) {
    const domain = this.config.get<string>('cookie.domain', 'localhost');
    res.clearCookie(this.ACCESS_COOKIE, { domain });
    res.clearCookie(this.REFRESH_COOKIE, { domain, path: '/v1/auth/refresh' });
  }

  // ── Audit log ────────────────────────────────────────────────────────────────

  private async createAuditLog(data: {
    userId: string;
    tenantId: string;
    action: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
  }) {
    await this.prisma.auditLog.create({
      data: {
        userId: data.userId,
        tenantId: data.tenantId,
        action: data.action,
        entityType: 'User',
        entityId: data.userId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        metadata: data.metadata,
      },
    }).catch(() => {/* Não quebra a operação principal se o log falhar */});
  }

  private getIp(req: Request): string {
    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      '0.0.0.0'
    );
  }
}
