# ─── Stage 1: deps ────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api-gateway/package.json ./apps/api-gateway/
COPY packages/shared/package.json ./packages/shared/
COPY packages/types/package.json ./packages/types/
COPY packages/database/package.json ./packages/database/
RUN pnpm install --frozen-lockfile --filter=@nexcrm/api-gateway...

# ─── Stage 2: builder ─────────────────────────────────────────────────────────
FROM deps AS builder
COPY apps/api-gateway ./apps/api-gateway
COPY packages/shared ./packages/shared
COPY packages/types ./packages/types
COPY packages/database ./packages/database
COPY packages/configs ./packages/configs
RUN pnpm --filter=@nexcrm/api-gateway build

# ─── Stage 3: runner ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN addgroup --system --gid 1001 nestjs && \
    adduser --system --uid 1001 nestjs
WORKDIR /app

COPY --from=builder --chown=nestjs:nestjs /app/apps/api-gateway/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/apps/api-gateway/package.json ./

USER nestjs
EXPOSE 3000
ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/health/live || exit 1

CMD ["node", "dist/main"]
