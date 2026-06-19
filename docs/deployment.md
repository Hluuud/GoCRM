# Deployment Guide — NexCRM

## Environments

| Environment | Branch | URL | Notes |
|---|---|---|---|
| Development | `feature/*` | localhost | Docker Compose dev |
| Staging | `develop` | staging.nexcrm.com | Auto-deploy via CI |
| Production | `main` | app.nexcrm.com | Manual approval required |

---

## Prerequisites

- Docker 24+ and Docker Compose v2
- pnpm 9+
- Node.js 20+
- PostgreSQL 16 (managed or via Docker)
- Redis 7 (managed or via Docker)
- RabbitMQ 3.12 (managed or via Docker)

---

## Development Setup

```bash
# 1. Clone and install dependencies
git clone https://github.com/your-org/nexcrm.git
cd nexcrm
pnpm install

# 2. Copy environment files
cp .env.example .env
for service in apps/*/; do
  cp "$service/.env.example" "$service/.env"
done

# 3. Start infrastructure
pnpm docker:dev

# 4. Run migrations and seed
pnpm db:migrate
pnpm db:seed

# 5. Start the Next.js frontend
pnpm dev
```

---

## Production Deployment

### Docker Compose (single-server)

```bash
# 1. Build all service images
docker compose -f docker-compose.prod.yml build

# 2. Set secrets in .env.production
cp .env.example .env.production
# Edit .env.production with production values

# 3. Deploy
docker compose -f docker-compose.prod.yml --env-file .env.production up -d

# 4. Run migrations
docker compose -f docker-compose.prod.yml exec api-gateway \
  sh -c "cd /app && npx prisma migrate deploy"
```

### Kubernetes (Helm chart — coming soon)

```bash
# Install with Helm
helm install nexcrm ./helm/nexcrm \
  --namespace nexcrm \
  --create-namespace \
  --values ./helm/nexcrm/values.production.yaml
```

---

## Service Ports

| Service | Dev Port | Internal Port |
|---|---|---|
| Next.js Frontend | 3000 | 3000 |
| API Gateway | 3000 | 3000 |
| Auth Service | 3001 | 3001 |
| CRM Service | 3002 | 3002 |
| Finance Service | 3003 | 3003 |
| Notification Service | 3004 | 3004 |
| AI Service | 3005 | 3005 |
| Workflow Service | 3006 | 3006 |
| PostgreSQL | 5432 | 5432 |
| Redis | 6379 | 6379 |
| RabbitMQ (AMQP) | 5672 | 5672 |
| RabbitMQ (Management) | 15672 | 15672 |
| Grafana | 3001 | 3000 |
| Prometheus | 9090 | 9090 |
| pgAdmin | 5050 | 80 |

---

## Database Migrations

```bash
# Create a new migration
pnpm db:migrate --name add_lead_source_field

# Apply pending migrations (CI/CD)
pnpm db:migrate:prod

# Roll back (manual — Prisma does not support auto-rollback)
# Edit the migration file and re-run
```

---

## Zero-Downtime Deployments

1. Deploy new service version (canary) alongside existing
2. Route 10% of traffic to canary via Nginx upstream weights
3. Monitor error rates and latency in Grafana for 15 minutes
4. If healthy, shift 100% traffic to new version
5. Remove old containers

---

## Rollback Procedure

```bash
# Identify last stable tag
docker images nexcrm/auth-service | head -5

# Roll back a specific service
docker service update --image nexcrm/auth-service:v1.2.3 nexcrm_auth-service

# Or with compose
docker compose -f docker-compose.prod.yml \
  up -d --no-deps --force-recreate auth-service
```

---

## Health Checks

All services expose:
- `GET /health` — liveness probe
- `GET /health/ready` — readiness probe

Kubernetes probes configuration:
```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10
readinessProbe:
  httpGet:
    path: /health/ready
    port: 3001
  initialDelaySeconds: 5
  periodSeconds: 5
```

---

## Secrets Management

Never commit secrets. Use one of:

1. **Docker secrets** (Swarm mode)
2. **Kubernetes Secrets** + Sealed Secrets or External Secrets Operator
3. **HashiCorp Vault** (recommended for enterprise)
4. **AWS Secrets Manager / GCP Secret Manager**

Minimum required secrets per environment:

```
JWT_SECRET              # 256-bit random
JWT_REFRESH_SECRET      # 256-bit random
DATABASE_URL            # Full connection string
REDIS_PASSWORD          # Redis auth
RABBITMQ_URL            # Full AMQP URL with credentials
SMTP_PASS               # Email provider password
OPENAI_API_KEY          # Optional AI features
WEBHOOK_SECRET          # Outbound webhook signing
```
