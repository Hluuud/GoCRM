# Observability — NexCRM

## Stack

| Layer | Tool | Port (dev) |
|---|---|---|
| Metrics | Prometheus | 9090 |
| Dashboards | Grafana | 3001 |
| Distributed Tracing | Tempo | 3200 |
| Log Aggregation | Loki | 3100 |
| Collector | OpenTelemetry Collector | 4317 (gRPC), 4318 (HTTP) |

## Architecture

```
Services → OTel SDK → OTel Collector → Prometheus (metrics)
                                    → Tempo (traces)
                                    → Loki (logs)
                                    ↓
                                 Grafana (unified UI)
```

## Instrumentation

Every NestJS service initializes OpenTelemetry in `src/tracing.ts` **before** any NestJS module loads:

```typescript
// src/tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: process.env.SERVICE_NAME,
  traceExporter: new OTLPTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT }),
  metricReader: new PrometheusExporter({ port: 9464 }),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

The `main.ts` imports tracing before anything else:

```typescript
import './tracing'; // must be first import
import { NestFactory } from '@nestjs/core';
```

## Prometheus Scrape Config

Each service exposes `/metrics` on its dedicated port (see `infra/monitoring/prometheus/prometheus.dev.yml`).

## Grafana Dashboards

Access Grafana at `http://localhost:3001` (credentials: `admin` / `admin` for dev).

Pre-configured datasources (auto-provisioned via `infra/monitoring/grafana/provisioning/`):
- Prometheus → `http://prometheus:9090`
- Tempo → `http://tempo:3200`
- Loki → `http://loki:3100`

## Key Metrics to Monitor

| Metric | Description |
|---|---|
| `http_request_duration_seconds` | Latency percentiles per route |
| `http_requests_total` | Request count by status code |
| `rabbitmq_queue_messages` | Queue depth |
| `prisma_query_duration_seconds` | DB query latency |
| `nodejs_heap_used_bytes` | Memory pressure |

## Alerting

Prometheus alerting rules should be placed in `infra/monitoring/prometheus/rules/`. Example:

```yaml
groups:
  - name: nexcrm.rules
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 2m
        annotations:
          summary: "High HTTP error rate on {{ $labels.service }}"
```

## Log Correlation

All logs are structured JSON with `traceId` and `spanId` fields injected by the `LoggingInterceptor`. This enables trace-to-log correlation in Grafana's Explore view.

## Running the Observability Stack

```bash
# Start only observability containers
docker compose -f docker-compose.dev.yml up -d prometheus grafana tempo loki otel-collector

# Access
open http://localhost:3001  # Grafana
open http://localhost:9090  # Prometheus
```
