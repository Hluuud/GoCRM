import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtPayload } from '../types/jwt.types';

/**
 * Garante que o tenantId do request (header/param) corresponde
 * ao tenantId do token JWT do usuário autenticado.
 * Previne IDOR cross-tenant.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Record<string, any>>();
    const user = request.user as JwtPayload | undefined;

    if (!user) {
      throw new UnauthorizedException('Token de autenticação ausente.');
    }

    // tenantId pode vir do header X-Tenant-ID ou do param :tenantId
    const headerTenantId = request.headers?.['x-tenant-id'] as string | undefined;
    const paramTenantId = request.params?.tenantId as string | undefined;
    const requestTenantId = headerTenantId ?? paramTenantId;

    if (requestTenantId && requestTenantId !== user.tenantId) {
      throw new ForbiddenException(
        'Acesso negado: o tenant solicitado não corresponde ao seu contexto.',
      );
    }

    // Injeta tenantId no request para uso nos controllers
    request['tenantId'] = user.tenantId;

    return true;
  }
}
