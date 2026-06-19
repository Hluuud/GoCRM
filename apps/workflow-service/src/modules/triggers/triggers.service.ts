import { Injectable, Logger } from '@nestjs/common';

export type TriggerType =
  | 'lead.created'
  | 'lead.status_changed'
  | 'deal.closed_won'
  | 'deal.closed_lost'
  | 'deal.stage_changed'
  | 'invoice.overdue'
  | 'task.due_soon'
  | 'contact.inactivity';

export interface TriggerEvent {
  type: TriggerType;
  tenantId: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

export interface RegisteredTrigger {
  id: string;
  tenantId: string;
  type: TriggerType;
  conditions: Record<string, unknown>;
  automationId: string;
  isActive: boolean;
  createdAt: Date;
}

@Injectable()
export class TriggersService {
  private readonly logger = new Logger(TriggersService.name);

  // In-memory store for demo; replace with DB-backed store in production
  private triggers: RegisteredTrigger[] = [];

  async registerTrigger(
    tenantId: string,
    type: TriggerType,
    conditions: Record<string, unknown>,
    automationId: string,
  ): Promise<RegisteredTrigger> {
    const trigger: RegisteredTrigger = {
      id: crypto.randomUUID(),
      tenantId,
      type,
      conditions,
      automationId,
      isActive: true,
      createdAt: new Date(),
    };

    this.triggers.push(trigger);
    this.logger.log(`Registered trigger [${type}] for tenant ${tenantId}`);
    return trigger;
  }

  async listByTenant(tenantId: string): Promise<RegisteredTrigger[]> {
    return this.triggers.filter((t) => t.tenantId === tenantId && t.isActive);
  }

  async deactivate(triggerId: string, tenantId: string): Promise<{ success: boolean }> {
    const trigger = this.triggers.find(
      (t) => t.id === triggerId && t.tenantId === tenantId,
    );

    if (trigger) {
      trigger.isActive = false;
      this.logger.log(`Deactivated trigger ${triggerId}`);
    }

    return { success: !!trigger };
  }

  async evaluateTrigger(event: TriggerEvent): Promise<RegisteredTrigger[]> {
    const matching = this.triggers.filter(
      (t) =>
        t.tenantId === event.tenantId &&
        t.type === event.type &&
        t.isActive &&
        this.matchesConditions(t.conditions, event.payload),
    );

    if (matching.length > 0) {
      this.logger.log(
        `Event [${event.type}] matched ${matching.length} triggers for tenant ${event.tenantId}`,
      );
    }

    return matching;
  }

  private matchesConditions(
    conditions: Record<string, unknown>,
    payload: Record<string, unknown>,
  ): boolean {
    // If no conditions are specified, the trigger always fires
    if (Object.keys(conditions).length === 0) return true;

    return Object.entries(conditions).every(([key, value]) => {
      return payload[key] === value;
    });
  }
}
