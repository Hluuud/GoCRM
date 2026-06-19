import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './modules/health/health.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { ProxyModule } from './modules/proxy/proxy.module';
import { RequestIdMiddleware } from './middleware/request-id.middleware';

@Module({
  imports: [
    // ── Config ────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      cache: true,
    }),

    // ── Rate Limiting ─────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name: 'global',
        ttl: 60000,  // 1 minuto
        limit: 100,  // 100 requests por IP
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 10,   // 10 requests para endpoints de auth
      },
    ]),

    // ── Módulos da aplicação ──────────────────────────────────
    HealthModule,
    MetricsModule,
    ProxyModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestIdMiddleware)
      .forRoutes('*');
  }
}
