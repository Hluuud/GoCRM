#!/usr/bin/env bash
# NexCRM Infrastructure Setup Script
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${CYAN}[nexcrm]${NC} $1"; }
ok()   { echo -e "${GREEN}[ok]${NC} $1"; }
warn() { echo -e "${YELLOW}[warn]${NC} $1"; }
err()  { echo -e "${RED}[error]${NC} $1"; exit 1; }

# Check prerequisites
check_deps() {
  log "Checking dependencies..."
  command -v docker  >/dev/null 2>&1 || err "Docker not found. Install from https://docs.docker.com/get-docker/"
  command -v node    >/dev/null 2>&1 || err "Node.js not found. Install from https://nodejs.org/"
  command -v pnpm    >/dev/null 2>&1 || err "pnpm not found. Run: npm i -g pnpm"
  node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  [[ $node_version -lt 20 ]] && err "Node.js 20+ required. Current: $(node -v)"
  ok "All dependencies satisfied"
}

# Copy env file
setup_env() {
  log "Setting up environment..."
  if [ ! -f .env ]; then
    cp .env.example .env
    warn ".env file created from .env.example — fill in your secrets before running services"
  else
    ok ".env already exists"
  fi
}

# Install dependencies
install_deps() {
  log "Installing workspace dependencies..."
  pnpm install
  ok "Dependencies installed"
}

# Generate Prisma client
setup_prisma() {
  log "Generating Prisma client..."
  cd packages/database && pnpm prisma generate && cd ../..
  ok "Prisma client generated"
}

# Start infrastructure services
start_infra() {
  log "Starting infrastructure containers (dev)..."
  docker compose -f docker-compose.dev.yml up -d postgres redis rabbitmq
  log "Waiting for Postgres to be ready..."
  until docker exec nexcrm_postgres_dev pg_isready -U nexcrm -d nexcrm_dev >/dev/null 2>&1; do
    printf '.'
    sleep 2
  done
  echo ""
  ok "PostgreSQL is ready"
}

# Run Prisma migrations
run_migrations() {
  log "Running database migrations..."
  cd packages/database && pnpm prisma migrate dev --name init && cd ../..
  ok "Migrations applied"
}

# Seed database
seed_database() {
  log "Seeding database with initial data..."
  cd packages/database && pnpm prisma db seed && cd ../..
  ok "Database seeded"
}

# Start observability stack
start_observability() {
  log "Starting observability stack (Prometheus, Grafana, Loki, Tempo)..."
  docker compose -f docker-compose.dev.yml up -d prometheus grafana loki tempo otel-collector
  ok "Observability stack started"
  log "  Grafana:    http://localhost:3100 (admin/admin)"
  log "  Prometheus: http://localhost:9090"
  log "  RabbitMQ:   http://localhost:15672 (nexcrm/nexcrm_rmq_dev)"
  log "  pgAdmin:    http://localhost:5050 (admin@nexcrm.com/admin)"
}

main() {
  echo ""
  echo -e "${CYAN}=================================${NC}"
  echo -e "${CYAN}  NexCRM Dev Environment Setup   ${NC}"
  echo -e "${CYAN}=================================${NC}"
  echo ""

  check_deps
  setup_env
  install_deps
  setup_prisma
  start_infra
  run_migrations
  seed_database
  start_observability

  echo ""
  ok "NexCRM development environment is ready!"
  log "Run 'pnpm dev' to start the Next.js frontend"
  log "Run individual services with: cd apps/<service> && pnpm start:dev"
}

main "$@"
