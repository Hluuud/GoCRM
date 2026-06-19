import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Record<string, any>>();
    const { method, url, ip } = request;
    const requestId = request.headers?.['x-request-id'] as string | undefined;
    const userId = request.user?.sub;
    const tenantId = request.tenantId;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<Record<string, any>>();
          const statusCode = response.statusCode;
          const duration = Date.now() - startTime;

          this.logger.log({
            requestId,
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            userId,
            tenantId,
            ip,
          });
        },
        error: (error: Record<string, any>) => {
          const duration = Date.now() - startTime;
          this.logger.error({
            requestId,
            method,
            url,
            duration: `${duration}ms`,
            userId,
            tenantId,
            ip,
            error: error?.message,
          });
        },
      }),
    );
  }
}
