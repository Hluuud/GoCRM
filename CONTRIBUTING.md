# Contributing to NexCRM

Thank you for your interest in contributing to NexCRM. This document outlines the process and standards for contributing code.

---

## Development Workflow

1. **Fork** the repository and create a feature branch from `develop`
2. Branch naming convention: `type/short-description`
   - `feat/add-lead-scoring`
   - `fix/auth-cookie-expiry`
   - `docs/update-api-reference`
   - `refactor/crm-repository-pattern`
3. Make your changes following the code standards below
4. Write or update tests (coverage must remain >= 70%)
5. Run `pnpm lint && pnpm test` and ensure all checks pass
6. Open a Pull Request targeting `develop`

---

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons, etc. |
| `refactor` | Code change that is neither fix nor feature |
| `perf` | Performance improvement |
| `test` | Adding or updating tests |
| `chore` | Build process, dependency updates |
| `ci` | CI/CD configuration changes |

### Scopes

`auth`, `crm`, `finance`, `notification`, `ai`, `workflow`, `gateway`, `database`, `infra`, `docs`

### Examples

```
feat(crm): add lead scoring algorithm with configurable weights
fix(auth): prevent refresh token reuse after revocation
docs(api): add missing endpoint descriptions for deals module
perf(crm): add database index on leads.tenant_id + status
```

---

## Code Standards

### TypeScript

- Strict TypeScript — no `any` unless absolutely necessary (add a comment explaining why)
- All public methods must have explicit return types
- Use `readonly` for properties that should not be mutated
- Prefer `interface` over `type` for object shapes

### NestJS Services

- **Single Responsibility**: one service = one domain concept
- **Repository pattern**: services never access Prisma directly — always through a repository
- **No business logic in controllers**: controllers only validate input, delegate to services, and format responses
- **Error handling**: use NestJS built-in exceptions (`NotFoundException`, `ConflictException`, etc.)
- **Tenant isolation**: every database query that touches user data must filter by `tenantId`

### Frontend (Next.js)

- Components go in `components/` — pages go in `app/`
- Use `SWR` for client-side data fetching — never `useEffect` + `fetch`
- Keep components focused and composable — one component per concern
- Prefer server components for data fetching; client components for interactivity

---

## Pull Request Process

1. Fill out the PR template completely
2. Link the related issue (if applicable) with `Closes #<issue-number>`
3. Ensure all CI checks pass (lint, test, build)
4. Request review from at least one team member
5. Address all review comments before merging
6. Squash merge into `develop` using the PR title as the commit message

---

## Local Development

See [docs/onboarding.md](./docs/onboarding.md) for the full setup guide.

Quick start:

```bash
pnpm install
cp .env.example .env
pnpm docker:dev
pnpm db:migrate
pnpm dev
```

---

## Questions?

Open a [GitHub Discussion](https://github.com/your-org/nexcrm/discussions) or reach out to the maintainers.
