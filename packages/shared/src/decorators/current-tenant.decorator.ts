import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extrai o tenantId do request (injetado pelo TenantInterceptor).
 * Uso: @CurrentTenant() tenantId: string
 */
export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId as string;
  },
);
