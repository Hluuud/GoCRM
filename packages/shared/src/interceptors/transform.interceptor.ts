import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  requestId?: string;
}

/**
 * Envolve todas as respostas de sucesso no envelope padrão da API.
 * { success: true, data: <payload>, timestamp: "...", requestId: "..." }
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest<Record<string, any>>();
    const requestId = request.headers?.['x-request-id'] as string | undefined;

    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        ...(requestId ? { requestId } : {}),
      })),
    );
  }
}
