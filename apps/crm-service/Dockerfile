FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/crm-service/package.json ./apps/crm-service/
COPY packages/shared/package.json ./packages/shared/
COPY packages/types/package.json ./packages/types/
COPY packages/database/package.json ./packages/database/
RUN pnpm install --frozen-lockfile --filter=@nexcrm/crm-service...

FROM deps AS builder
COPY apps/crm-service ./apps/crm-service
COPY packages ./packages
RUN pnpm --filter=@nexcrm/database prisma generate
RUN pnpm --filter=@nexcrm/crm-service build

FROM node:20-alpine AS runner
RUN apk add --no-cache dumb-init && addgroup --system --gid 1001 nestjs && adduser --system --uid 1001 nestjs
WORKDIR /app
COPY --from=builder --chown=nestjs:nestjs /app/apps/crm-service/dist ./dist
COPY --from=builder --chown=nestjs:nestjs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nestjs /app/apps/crm-service/package.json ./
USER nestjs
EXPOSE 3020
ENV NODE_ENV=production
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 CMD wget -qO- http://localhost:3020/health/live || exit 1
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main"]
