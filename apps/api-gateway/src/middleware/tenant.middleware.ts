import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Tenant pode vir do header X-Tenant-ID ou do subdomínio
    const tenantId =
      (req.headers['x-tenant-id'] as string) ??
      this.extractTenantFromHost(req.hostname);

    if (!tenantId) {
      throw new BadRequestException(
        'Tenant ID obrigatório. Forneça o header X-Tenant-ID.',
      );
    }

    req.headers['x-tenant-id'] = tenantId;
    next();
  }

  private extractTenantFromHost(hostname: string): string | null {
    // Extrai subdomínio: tenant1.nexcrm.com → tenant1
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const subdomain = parts[0];
      // Exclui subdomínios reservados
      const reserved = ['www', 'app', 'api', 'admin', 'mail', 'localhost'];
      if (!reserved.includes(subdomain)) {
        return subdomain;
      }
    }
    return null;
  }
}
