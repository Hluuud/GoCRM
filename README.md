# NexCRM — Enterprise CRM Platform

A production-ready, enterprise-grade CRM platform built as a **TypeScript monorepo** with Next.js 16 frontend and NestJS microservices backend.

---

## Architecture Overview

```
nexcrm/
├── apps/
│   ├── web/                    # Next.js 16 frontend (App Router)
│   ├── api-gateway/            # NestJS API Gateway — port 3001
│   ├── auth-service/           # NestJS Auth — port 3002
│   ├── crm-service/            # NestJS CRM — port 3003
│   ├── finance-service/        # NestJS Finance — port 3004
│   ├── notification-service/   # NestJS Notifications — port 3005
│   ├── ai-service/             # NestJS AI/LLM — port 3006
│   └── workflow-service/       # NestJS Workflows — port 3007
├── packages/
│   ├── database/               # Prisma schema, migrations, seed
│   ├── shared/                 # NestJS guards, interceptors, utilities
│   ├── types/                  # Shared TypeScript types and interfaces
│   └── configs/                # Shared tsconfig, eslint presets
├── infra/
│   ├── docker/                 # Postgres init, RabbitMQ definitions
│   ├── monitoring/             # Prometheus, Grafana, Loki, Tempo, OTel
│   ├── nginx/                  # Reverse proxy config (prod)
│   └── scripts/                # setup.sh and helper scripts
├── .github/
│   └── workflows/              # CI/CD: ci.yml, release.yml
├── docker-compose.dev.yml      # Full local dev stack (13 containers)
└── docker-compose.prod.yml     # Production compose
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### 1. Automated Setup (recommended)

```bash
git clone https://github.com/your-org/nexcrm.git
cd nexcrm
bash infra/scripts/setup.sh
```

This script will:
1. Check prerequisites
2. Copy `.env.example` to `.env`
3. Install all workspace dependencies
4. Generate the Prisma client
5. Start PostgreSQL, Redis, and RabbitMQ
6. Run database migrations
7. Seed the database with initial data
8. Start the observability stack

### 2. Start the frontend

```bash
pnpm dev
```

### 3. Start backend services (each in their own terminal)

```bash
cd apps/auth-service && pnpm start:dev
cd apps/crm-service  && pnpm start:dev
cd apps/api-gateway  && pnpm start:dev
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all required values. See [docs/environment.md](docs/environment.md) for the full reference.

**Required for all services:**

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `RABBITMQ_URL` | RabbitMQ AMQP URL |
| `JWT_SECRET` | Access token signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Refresh token signing secret (min 32 chars) |

**Service-specific:**

| Variable | Service | Description |
|---|---|---|
| `OPENAI_API_KEY` | ai-service | OpenAI API key |
| `SMTP_HOST` | notification-service | SMTP host |
| `SMTP_USER` | notification-service | SMTP username |
| `SMTP_PASS` | notification-service | SMTP password |

---

## Database

The Prisma schema (`packages/database/prisma/schema.prisma`) defines 18+ models including multi-tenancy, RBAC, full CRM entities, and audit logging.

```bash
# Generate client
pnpm db:generate

# Create migration
pnpm db:migrate

# Deploy migrations (prod)
pnpm db:migrate:prod

# Open Prisma Studio
pnpm db:studio

# Seed database
pnpm db:seed
```

---

## API Documentation

Each service exposes Swagger docs at `/api/docs` when running:

| Service | URL |
|---|---|
| API Gateway | http://localhost:3001/api/docs |
| Auth Service | http://localhost:3002/api/docs |
| CRM Service | http://localhost:3003/api/docs |
| Finance Service | http://localhost:3004/api/docs |
| AI Service | http://localhost:3006/api/docs |
| Workflow Service | http://localhost:3007/api/docs |

---

## Infrastructure URLs (Dev)

| Service | URL | Credentials |
|---|---|---|
| Frontend | http://localhost:3000 | — |
| Grafana | http://localhost:3100 | admin / admin |
| Prometheus | http://localhost:9090 | — |
| RabbitMQ Management | http://localhost:15672 | nexcrm / nexcrm_rmq_dev |
| pgAdmin | http://localhost:5050 | admin@nexcrm.com / admin |
| Redis Commander | http://localhost:8081 | — |

---

## Testing

```bash
# Unit tests (all workspaces)
pnpm test

# Watch mode
pnpm test -- --watch

# Coverage report
pnpm test -- --coverage
```

---

## Deployment

### Docker (all services)

```bash
# Build all images
docker compose -f docker-compose.prod.yml build

# Start production stack
pnpm docker:prod

# View logs
pnpm docker:logs
```

### Vercel (frontend only)

The Next.js frontend (`apps/web`) deploys automatically to Vercel on push to `main`. Set the root directory to `apps/web` in Vercel project settings.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit using Conventional Commits: `git commit -m "feat(crm): add bulk lead import"`
4. Push and open a Pull Request using the provided template

Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

---

## Security

- JWT HttpOnly cookies with refresh token rotation
- Bcrypt password hashing (cost factor 12)
- Rate limiting per IP via NestJS Throttler
- Helmet security headers on all services
- SQL injection prevention via Prisma parameterized queries
- MFA-ready (TOTP via `speakeasy`)
- Full audit log trail on all data mutations

Report vulnerabilities to: security@nexcrm.com

---

## License

MIT License — see [LICENSE](LICENSE)
