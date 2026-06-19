import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Decorator para restringir acesso por roles.
 * Uso: @Roles('ADMIN', 'MANAGER')
 */
export const Roles = (...roles: string[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator para restringir acesso por permission granular.
 * Uso: @RequirePermission('leads', 'create')
 */
export const RequirePermission = (resource: string, action: string): MethodDecorator & ClassDecorator =>
  SetMetadata(PERMISSIONS_KEY, [{ resource, action }]);

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marca um endpoint como público (sem autenticação).
 * Uso: @Public()
 */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_KEY, true);
