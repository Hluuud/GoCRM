export default () => ({
  port: parseInt(process.env.CRM_SERVICE_PORT ?? '3020', 10),
  env: process.env.NODE_ENV ?? 'development',
  database: { url: process.env.DATABASE_URL! },
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? 'amqp://nexcrm:nexcrm@localhost:5672',
    exchange: process.env.RABBITMQ_CRM_EXCHANGE ?? 'nexcrm.crm',
    deadLetterExchange: 'nexcrm.crm.dlx',
    prefetch: parseInt(process.env.RABBITMQ_PREFETCH ?? '10', 10),
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET!,
  },
  pagination: {
    defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT ?? '20', 10),
    maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT ?? '100', 10),
  },
});
