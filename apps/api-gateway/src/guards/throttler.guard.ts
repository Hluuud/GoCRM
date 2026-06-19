import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // Rate limit por tenant + IP para maior granularidade
    const tenantId = req.headers['x-tenant-id'] ?? 'global';
    const ip = req.ip ?? req.connection?.remoteAddress ?? '0.0.0.0';
    return `${tenantId}:${ip}`;
  }
}
