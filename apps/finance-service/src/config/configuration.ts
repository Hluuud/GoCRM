export default () => ({
  port: parseInt(process.env.FINANCE_SERVICE_PORT ?? '3030', 10),
  env: process.env.NODE_ENV ?? 'development',
  database: { url: process.env.DATABASE_URL! },
  jwt: { accessSecret: process.env.JWT_ACCESS_SECRET! },
  rabbitmq: {
    url: process.env.RABBITMQ_URL ?? 'amqp://nexcrm:nexcrm@localhost:5672',
    exchange: 'nexcrm.finance',
  },
  invoice: {
    overdueCheckCron: process.env.INVOICE_OVERDUE_CRON ?? '0 9 * * *', // Diário às 09:00
    dueSoonDays: parseInt(process.env.INVOICE_DUE_SOON_DAYS ?? '3', 10),
  },
});
