# NexCRM — Architecture Deep Dive

## Design Principles

1. **Domain isolation** — each bounded context is its own NestJS service with its own database connection and event contract
2. **Async-first** — services communicate via RabbitMQ events (topic exchange) instead of synchronous HTTP calls where latency tolerance allows
3. **Tenant isolation** — every database query is scoped to `tenantId`; the API Gateway injects the tenant context from the JWT into every downstream request
4. **Clean Architecture** — each service follows Controller → Service → Repository layers; no business logic leaks into controllers or repositories
5. **Observability by default** — all services emit OpenTelemetry traces, metrics, and structured logs from day one

---

## Service Contracts

### API Gateway (port 3001)

The single entry point for all external traffic. Responsibilities:
- JWT validation and user context extraction
- Tenant context injection (`X-Tenant-ID` header)
- Per-IP and per-user rate limiting (Throttler)
- Request ID generation and propagation
- HTTP → downstream service routing
- Swagger aggregation

### Auth Service (port 3002)

Owns all identity and access management:
- `POST /auth/register` — creates user + tenant + owner membership in a transaction
- `POST /auth/login` — validates credentials, issues JWT (15m) + refresh token (7d) stored in Redis
- `POST /auth/refresh` — rotates refresh token; old token is immediately invalidated
- `POST /auth/logout` — deletes refresh token from Redis, clears HttpOnly cookie
- `POST /auth/forgot-password` / `POST /auth/reset-password` — time-limited signed reset tokens
- `POST /mfa/setup` — generates TOTP secret + QR code
- `POST /mfa/verify` — validates TOTP code and enables MFA on account

**Token strategy:**
```
Access Token:  JWT, 15min TTL, signed with JWT_SECRET, stored in HttpOnly cookie
Refresh Token: Opaque UUID, 7d TTL, stored in Redis with device fingerprint
```

### CRM Service (port 3003)

Full CRUD for all CRM entities with tenant isolation and event publishing:

| Resource | Route | Events Published |
|---|---|---|
| Leads | `/leads` | `lead.created`, `lead.status_changed`, `lead.converted` |
| Contacts | `/contacts` | `contact.created`, `contact.updated` |
| Companies | `/companies` | `company.created` |
| Deals | `/deals` | `deal.stage_changed`, `deal.won`, `deal.lost` |
| Tasks | `/tasks` | `task.created`, `task.overdue` |

All events are published to the `nexcrm.events` topic exchange in RabbitMQ with routing key matching the event name (e.g. `lead.created`).

### Finance Service (port 3004)

Invoice lifecycle management:
- Line item calculation with discount + tax per item
- Auto-generated invoice numbers
- Status machine: DRAFT → SENT → PAID | OVERDUE | CANCELLED
- Revenue aggregation endpoint for dashboard KPIs
- Monthly revenue series for charts

### Notification Service (port 3005)

Pure event consumer — no HTTP API. Subscribes to:
- `lead.created` → email to assigned owner
- `deal.won` → email to deal owner
- `invoice.overdue` → email to contact + owner
- Uses Nodemailer with Handlebars templates
- Webhook dispatcher with HMAC-SHA256 signature verification
- Failed messages are nacked to the DLQ (Dead Letter Queue) after 3 attempts

### AI Service (port 3006)

LLM-powered capabilities via OpenAI GPT-4:
- `POST /insights/generate` — analyzes CRM context snapshot and returns 4 typed insights
- `POST /chat` — stateless conversational assistant (history passed per request)
- `POST /insights/follow-up` — generates personalized follow-up message for a lead
- Graceful fallback to deterministic rule-based insights when the API is unavailable
- Redis caching for insights (TTL: 30min per tenant)

### Workflow Service (port 3007)

Event-driven automation engine:
- Rule-based trigger/condition/action system
- Conditions support: `eq`, `neq`, `contains`, `gt`, `lt` operators on any payload field
- Actions: `send_email`, `create_task`, `update_lead_status`, `assign_owner`, `send_webhook`, `send_notification`
- Bull queue (Redis-backed) with exponential backoff retry (3 attempts)
- Scheduled jobs: overdue task check (every hour), daily digest (weekdays 9am)

---

## Event Flow Example: Lead Created

```
1. Client → POST /api/v1/leads (API Gateway)
2. API Gateway validates JWT, injects tenantId
3. API Gateway → CRM Service POST /leads
4. CRM Service creates lead in PostgreSQL
5. CRM Service publishes `lead.created` to nexcrm.events exchange
6. RabbitMQ routes to:
   a. notification_queue → Notification Service sends email
   b. workflow_queue → Workflow Service checks automation rules
7. If a matching rule exists: Workflow Service executes actions
```

---

## Database Schema Highlights

- All tables have `id UUID DEFAULT gen_random_uuid()` primary keys
- All tables have `tenantId` for multi-tenant isolation
- Soft deletes via `deletedAt TIMESTAMP` — no data is ever hard deleted
- `AuditLog` records every create/update/delete with old and new values as JSONB
- `ApiKey` table supports per-key scopes and last-used tracking
- `RefreshToken` table with device fingerprint for concurrent session management
- GIN indexes on `tsvector` columns for full-text search on leads/contacts/companies
- `pg_trgm` trigram indexes for partial string matching

---

## Security Architecture

```
Browser
  └─ HTTPS → Nginx (TLS termination, security headers, rate limiting)
       └─ HTTP → API Gateway (JWT validation, tenant injection)
            ├─ Auth Service (bcrypt, TOTP, refresh token rotation)
            ├─ CRM Service  (tenant-scoped queries, RBAC guards)
            ├─ Finance Service
            ├─ AI Service
            └─ Workflow Service

Internal communication:
  - All service-to-service calls use internal Docker network (no TLS needed)
  - RabbitMQ uses AMQP with credentials; vhost isolation per environment
  - Redis uses password auth; no external exposure in prod
```

---

## Observability Stack

```
Services → OpenTelemetry SDK
  └─ OTLP → OTel Collector
       ├─ Traces → Tempo → Grafana
       ├─ Metrics → Prometheus → Grafana
       └─ Logs → Loki → Grafana
```

Grafana dashboards available (provisioned automatically):
- NexCRM Service Overview (request rates, error rates, latency p50/p95/p99)
- Infrastructure Overview (CPU, memory, disk per container)
- RabbitMQ Queue Monitor (message rates, consumer counts, DLQ depth)
- PostgreSQL Performance (query times, connection pool, cache hit ratio)
