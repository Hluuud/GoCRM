/**
 * NexCRM API Gateway — Bootstrap
 *
 * Responsabilidades:
 * - Ponto de entrada único para todos os clientes (web, mobile, API)
 * - Rate limiting global
 * - Request ID injection
 * - CORS configurável
 * - Helmet (security headers)
 * - Swagger/OpenAPI completo
 * - Métricas Prometheus em /metrics
 * - Health check em /health
 * - OpenTelemetry tracing
 */

import './tracing'; // Deve ser o primeiro import
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@nexcrm/shared';
import { TransformInterceptor } from '@nexcrm/shared';
import { LoggingInterceptor } from '@nexcrm/shared';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_GATEWAY_PORT', 4000);
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  const appUrl = configService.get<string>('APP_URL', 'http://localhost:3000');

  // ── Security Headers ─────────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: nodeEnv === 'production',
    }),
  );

  // ── Compression ───────────────────────────────────────────────
  app.use(compression());

  // ── CORS ─────────────────────────────────────────────────────
  app.enableCors({
    origin: nodeEnv === 'production' ? [appUrl] : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Tenant-ID',
      'X-Request-ID',
      'X-Device-Fingerprint',
    ],
    exposedHeaders: ['X-Request-ID', 'X-RateLimit-Remaining'],
  });

  // ── Global Prefix ─────────────────────────────────────────────
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'metrics', '/'],
  });

  // ── Global Validation Pipe ────────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,           // Remove campos não declarados no DTO
      forbidNonWhitelisted: true, // Lança erro ao receber campos extras
      transform: true,           // Transforma tipos automaticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: nodeEnv === 'production',
    }),
  );

  // ── Global Exception Filter ───────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Global Interceptors ───────────────────────────────────────
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // ── Swagger ───────────────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('NexCRM API')
      .setDescription(
        `API Gateway do NexCRM Enterprise CRM Platform.
        
**Autenticação:** JWT Bearer Token (HttpOnly cookie) ou API Key no header \`X-API-Key\`.

**Multi-tenancy:** Passe o tenant no header \`X-Tenant-ID\` ou use o token JWT que já o contém.

**Rate Limiting:** 100 req/min por IP. Endpoints de auth: 10 req/min.

**Versionamento:** Todos os endpoints começam com \`/api/v1/\``,
      )
      .setVersion('1.0.0')
      .setContact('NexCRM Engineering', 'https://nexcrm.io', 'engineering@nexcrm.io')
      .setLicense('Proprietary', 'https://nexcrm.io/terms')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'JWT',
      )
      .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'ApiKey')
      .addTag('Auth', 'Registro, login, refresh de tokens e MFA')
      .addTag('CRM — Leads', 'Gestão de leads e pipeline de vendas')
      .addTag('CRM — Contacts', 'Gestão de contatos e empresas')
      .addTag('CRM — Deals', 'Oportunidades e pipeline de deals')
      .addTag('CRM — Tasks', 'Gestão de tarefas e projetos')
      .addTag('Omnichannel', 'Conversas, mensagens e canais integrados')
      .addTag('Finance', 'Faturas, transações e relatórios financeiros')
      .addTag('AI', 'Assistente inteligente e insights de CRM')
      .addTag('Workflows', 'Automação de processos e triggers')
      .addTag('Settings', 'Configurações de tenant, usuários e integrações')
      .addTag('Health', 'Health checks e status dos serviços')
      .addServer(`http://localhost:${port}`, 'Desenvolvimento local')
      .addServer('https://api.nexcrm.io', 'Produção')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showExtensions: true,
      },
      customSiteTitle: 'NexCRM API Docs',
    });

    logger.log(`Swagger disponível em: http://localhost:${port}/api/docs`);
  }

  // ── Start ─────────────────────────────────────────────────────
  await app.listen(port, '0.0.0.0');

  logger.log(`API Gateway rodando em: http://localhost:${port}`);
  logger.log(`Ambiente: ${nodeEnv}`);
  logger.log(`Health check: http://localhost:${port}/health`);
  logger.log(`Metrics: http://localhost:${port}/metrics`);
}

bootstrap().catch((err) => {
  console.error('Falha ao iniciar API Gateway:', err);
  process.exit(1);
});
