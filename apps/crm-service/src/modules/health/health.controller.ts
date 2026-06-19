import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService, private memory: MemoryHealthIndicator) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.memory.checkHeap('memory_heap', 256 * 1024 * 1024)]);
  }

  @Get('live')
  live() {
    return { status: 'alive', service: 'crm-service', timestamp: new Date().toISOString() };
  }
}
