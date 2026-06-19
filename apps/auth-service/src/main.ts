import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from '@nexcrm/shared';
import { LoggingInterceptor, TransformInterceptor } from '@nexcrm/shared';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const port = config.get<number>('port', 3010);
  const env = config.get<string>('env', 'development');

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(cookieParser());
  app.set('trust proxy', 1);

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.enableCors({
    origin: config.get<string[]>('cors.origins', ['http://localhost:3001']),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-Tenant-ID',
    ],
  });

  // ── Versioning ─────────────────────────────────────────────────────────────
  app.enableVersioning({ type: VersioningType.URI });

  // ── Global pipes, filters, interceptors ───────────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // ── Swagger (apenas em desenvolvimento) ───────────────────────────────────
  if (env !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('NexCRM — Auth Service')
      .setDescription('Serviço de autenticação: JWT, sessões, MFA, RBAC')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
      .addCookieAuth('access_token')
      .addTag('Auth', 'Registro, login, logout, refresh')
      .addTag('Users', 'Gestão de usuários')
      .addTag('Sessions', 'Gestão de sessões ativas')
      .addTag('MFA', 'Autenticação multifator')
      .addTag('Health', 'Health checks')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });
  }

  await app.listen(port);
  console.log(`[auth-service] Rodando na porta ${port} (${env})`);
}

bootstrap().catch(console.error);
