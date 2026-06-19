# NexCRM — Developer Onboarding

Welcome to the NexCRM team. This guide will get you from zero to a fully running development environment.

## Prerequisites

Install these tools before cloning the repository:

| Tool | Version | Install |
|---|---|---|
| Node.js | 20+ | https://nodejs.org or `nvm install 20` |
| pnpm | 9+ | `npm install -g pnpm` |
| Docker Desktop | Latest | https://www.docker.com/products/docker-desktop |
| Git | 2.40+ | `brew install git` / system package |

## Step 1: Clone and Setup

```bash
git clone https://github.com/your-org/nexcrm.git
cd nexcrm

# Automated setup (recommended for first-time setup)
bash infra/scripts/setup.sh
```

If you prefer manual setup:
```bash
cp .env.example .env
# Edit .env with your local secrets
pnpm install
pnpm db:generate
pnpm docker:dev      # starts postgres, redis, rabbitmq
sleep 10             # wait for postgres
pnpm db:migrate
pnpm db:seed
```

## Step 2: Start Services

Open separate terminals for each service you need:

```bash
# Terminal 1: Frontend
pnpm dev

# Terminal 2: API Gateway (required for all API calls)
cd apps/api-gateway && pnpm start:dev

# Terminal 3: Auth Service (required for login/register)
cd apps/auth-service && pnpm start:dev

# Terminal 4: CRM Service (required for CRM features)
cd apps/crm-service && pnpm start:dev
```

## Step 3: Verify Setup

1. Open http://localhost:3000 — you should see the NexCRM login page
2. Register a new account at http://localhost:3000/register
3. Log in and explore the dashboard
4. Open http://localhost:3001/api/docs — API Gateway Swagger

## Project Structure

When adding a new feature, follow this pattern:

### Adding a new module to an existing service

```
apps/crm-service/src/modules/
└── my-new-module/
    ├── my-new-module.module.ts      # Module definition
    ├── my-new-module.controller.ts  # HTTP endpoints
    ├── my-new-module.service.ts     # Business logic
    ├── my-new-module.repository.ts  # Database queries (Prisma)
    ├── my-new-module.events.ts      # RabbitMQ event publishing
    └── dto/
        └── create-my-new-module.dto.ts   # Input validation
```

### Adding a new database table

1. Edit `packages/database/prisma/schema.prisma`
2. Run `pnpm db:migrate` (creates migration file)
3. Run `pnpm db:generate` (regenerates Prisma client)
4. Update the seed file if needed

## Git Workflow

We use **Trunk-Based Development** with short-lived feature branches:

```bash
# Create a feature branch
git checkout -b feat/crm-bulk-import

# Commit with Conventional Commits (enforced by commitlint)
git commit -m "feat(crm): add bulk lead import via CSV"
git commit -m "fix(auth): refresh token not expiring correctly"
git commit -m "docs(api): update swagger descriptions for leads"

# Push and open a Pull Request
git push origin feat/crm-bulk-import
```

**Commit types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

**Scopes:** `auth`, `crm`, `finance`, `notification`, `ai`, `workflow`, `gateway`, `db`, `infra`, `web`

## Code Quality

The pre-commit hook runs automatically:
1. **Prettier** — formats all staged files
2. **ESLint** — lints TypeScript files

The commit-msg hook validates:
1. **commitlint** — enforces Conventional Commits format

## Testing

```bash
# Run all unit tests
pnpm test

# Run tests for a specific service
cd apps/auth-service && pnpm test

# Watch mode
pnpm test -- --watch

# Coverage
pnpm test -- --coverage
```

## Getting Help

- Architecture questions: read `docs/architecture.md`
- Environment variables: read `docs/environment.md`
- Security questions: read `docs/security.md`
- Open an issue on GitHub for bugs or feature requests
- Team Slack: `#nexcrm-dev`
