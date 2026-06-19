export default () => ({
  port: parseInt(process.env.API_GATEWAY_PORT ?? '3000', 10),
  env: process.env.NODE_ENV ?? 'development',
  cors: {
    origins: (process.env.CORS_ORIGINS ?? 'http://localhost:3001').split(','),
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
  },
  services: {
    auth: process.env.AUTH_SERVICE_URL ?? 'http://auth-service:3010',
    crm: process.env.CRM_SERVICE_URL ?? 'http://crm-service:3020',
    finance: process.env.FINANCE_SERVICE_URL ?? 'http://finance-service:3030',
    notification: process.env.NOTIFICATION_SERVICE_URL ?? 'http://notification-service:3040',
    ai: process.env.AI_SERVICE_URL ?? 'http://ai-service:3050',
    workflow: process.env.WORKFLOW_SERVICE_URL ?? 'http://workflow-service:3060',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ?? 'access-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret-change-in-production',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  otel: {
    endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://otel-collector:4318',
    serviceName: process.env.OTEL_SERVICE_NAME ?? 'api-gateway',
  },
});
