# Environment Variables Reference

All variables must be present in the `.env` file at the monorepo root. Copy from `.env.example` to get started.

## Database

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | Full PostgreSQL connection string. Format: `postgresql://user:pass@host:5432/db?schema=public` |
| `POSTGRES_DB` | Yes (compose) | `nexcrm_dev` | Database name for Docker Compose |
| `POSTGRES_USER` | Yes (compose) | `nexcrm` | PostgreSQL user |
| `POSTGRES_PASSWORD` | Yes (compose) | — | PostgreSQL password |

## Cache

| Variable | Required | Default | Description |
|---|---|---|---|
| `REDIS_URL` | Yes | `redis://localhost:6379` | Full Redis connection string |
| `REDIS_HOST` | No | `localhost` | Redis hostname (used by individual services) |
| `REDIS_PORT` | No | `6379` | Redis port |
| `REDIS_PASSWORD` | Yes | — | Redis password |

## Message Broker

| Variable | Required | Default | Description |
|---|---|---|---|
| `RABBITMQ_URL` | Yes | `amqp://nexcrm:pass@localhost:5672/nexcrm` | Full AMQP connection URL |
| `RABBITMQ_USER` | Yes (compose) | `nexcrm` | RabbitMQ username |
| `RABBITMQ_PASSWORD` | Yes (compose) | — | RabbitMQ password |
| `RABBITMQ_VHOST` | No | `nexcrm` | RabbitMQ virtual host |

## Authentication

| Variable | Required | Default | Description |
|---|---|---|---|
| `JWT_SECRET` | Yes | — | Access token signing secret. Minimum 32 characters. Generate with: `openssl rand -base64 32` |
| `JWT_REFRESH_SECRET` | Yes | — | Refresh token signing secret. Minimum 32 characters. |
| `JWT_EXPIRES_IN` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `BCRYPT_ROUNDS` | No | `12` | Bcrypt cost factor. Do not set below 10 in production. |

## CORS & Networking

| Variable | Required | Default | Description |
|---|---|---|---|
| `CORS_ORIGINS` | No | `http://localhost:3000` | Comma-separated list of allowed origins |
| `GATEWAY_PORT` | No | `3001` | API Gateway listen port |
| `AUTH_SERVICE_URL` | No | `http://localhost:3002` | Auth service internal URL |
| `CRM_SERVICE_URL` | No | `http://localhost:3003` | CRM service internal URL |
| `FINANCE_SERVICE_URL` | No | `http://localhost:3004` | Finance service internal URL |

## Email (Notification Service)

| Variable | Required | Default | Description |
|---|---|---|---|
| `SMTP_HOST` | Yes | — | SMTP server hostname |
| `SMTP_PORT` | No | `587` | SMTP port |
| `SMTP_SECURE` | No | `false` | Use TLS (`true` for port 465) |
| `SMTP_USER` | Yes | — | SMTP username |
| `SMTP_PASS` | Yes | — | SMTP password |
| `SMTP_FROM` | No | `"NexCRM" <noreply@nexcrm.com>` | Default sender |

## AI Service

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Yes (ai-service) | — | OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4-turbo-preview` | OpenAI model to use |
| `AI_CACHE_TTL` | No | `1800` | Insights cache TTL in seconds |

## Observability

| Variable | Required | Default | Description |
|---|---|---|---|
| `OTEL_EXPORTER_OTLP_ENDPOINT` | No | `http://localhost:4318` | OpenTelemetry collector HTTP endpoint |
| `OTEL_SERVICE_NAME` | No | (auto per service) | Service name override |

## Application

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `development` | `development` or `production` |
| `LOG_LEVEL` | No | `info` | Logging level: `debug`, `info`, `warn`, `error` |
| `APP_URL` | No | `http://localhost:3000` | Public frontend URL (used in emails) |
