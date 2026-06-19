export default () => ({
  port: parseInt(process.env.AUTH_SERVICE_PORT ?? '3010', 10),
  env: process.env.NODE_ENV ?? 'development',
  cors: {
    origins: (process.env.CORS_ORIGINS ?? 'http://localhost:3001').split(','),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET!,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    emailSecret: process.env.JWT_EMAIL_SECRET!,
    emailExpiresIn: process.env.JWT_EMAIL_EXPIRES_IN ?? '1d',
    resetSecret: process.env.JWT_RESET_SECRET!,
    resetExpiresIn: process.env.JWT_RESET_EXPIRES_IN ?? '1h',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_AUTH_DB ?? '0', 10),
  },
  database: {
    url: process.env.DATABASE_URL!,
  },
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? 'amqp://nexcrm:nexcrm@localhost:5672',
    exchange: process.env.RABBITMQ_AUTH_EXCHANGE ?? 'nexcrm.auth',
  },
  rateLimit: {
    shortTtl: parseInt(process.env.RATE_LIMIT_SHORT_TTL ?? '1000', 10),
    shortLimit: parseInt(process.env.RATE_LIMIT_SHORT_LIMIT ?? '5', 10),
    longTtl: parseInt(process.env.RATE_LIMIT_LONG_TTL ?? '60000', 10),
    longLimit: parseInt(process.env.RATE_LIMIT_LONG_LIMIT ?? '100', 10),
    bruteForceMaxAttempts: parseInt(process.env.BRUTE_FORCE_MAX_ATTEMPTS ?? '5', 10),
    bruteForceLockoutMs: parseInt(process.env.BRUTE_FORCE_LOCKOUT_MS ?? '900000', 10),
  },
  cookie: {
    domain: process.env.COOKIE_DOMAIN ?? 'localhost',
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: (process.env.COOKIE_SAME_SITE ?? 'lax') as 'lax' | 'strict' | 'none',
  },
  mfa: {
    issuer: process.env.MFA_ISSUER ?? 'NexCRM',
  },
  email: {
    host: process.env.SMTP_HOST ?? 'localhost',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM ?? 'no-reply@nexcrm.com',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:3001',
  },
});
