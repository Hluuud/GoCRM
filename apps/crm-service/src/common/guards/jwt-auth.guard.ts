import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CanActivate } from '@nestjs/common';
import { Request } from 'express';

/**
 * Guard JWT para o CRM Service.
 * Valida o access_token do cookie ou header Authorization.
 * Injeta req.user com { id, email, tenantId, roles, permissions }.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user: any }>();
    const token = this.extractToken(req);

    if (!token) {
      throw new UnauthorizedException('Token de autenticação ausente.');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('jwt.accessSecret'),
      });
      req.user = {
        id: payload.sub,
        email: payload.email,
        tenantId: payload.tenantId,
        roles: payload.roles ?? [],
        permissions: payload.permissions ?? [],
      };
      return true;
    } catch {
      throw new UnauthorizedException('Token de autenticação inválido ou expirado.');
    }
  }

  private extractToken(req: Request): string | null {
    const cookieToken = (req as any).cookies?.['access_token'];
    if (cookieToken) return cookieToken;

    const authHeader = req.headers['authorization'];
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    return null;
  }
}
