import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';

export type TriggerEvent =
  | 'lead.created'
  | 'lead.status_changed'
  | 'deal.stage_changed'
  | 'deal.won'
  | 'deal.lost'
  | 'invoice.created'
  | 'invoice.overdue'
  | 'task.overdue'
  | 'contact.created';

export type ActionType =
  | 'send_email'
  | 'create_task'
  | 'update_lead_status'
  | 'assign_owner'
  | 'send_webhook'
  | 'send_notification';

export interface AutomationRule {
  id: string;
  tenantId: string;
  name: string;
  isActive: boolean;
  trigger: TriggerEvent;
  conditions?: { field: string; operator: string; value: unknown }[];
  actions: { type: ActionType; config: Record<string, unknown> }[];
  executionCount: number;
  lastExecutedAt?: Date;
}

export interface WorkflowJob {
  ruleId: string;
  tenantId: string;
  trigger: TriggerEvent;
  payload: Record<string, unknown>;
  attempt: number;
}

@Injectable()
export class AutomationService {
  private readonly logger = new Logger(AutomationService.name);

  // In-memory rule store — replace with Prisma in production
  private rules: Map<string, AutomationRule> = new Map();

  constructor(
    @InjectQueue('workflow') private readonly workflowQueue: Queue<WorkflowJob>,
  ) {}

  async registerRule(rule: AutomationRule): Promise<void> {
    this.rules.set(rule.id, rule);
    this.logger.log(`Rule registered: ${rule.name} (${rule.id})`);
  }

  async triggerEvent(tenantId: string, event: TriggerEvent, payload: Record<string, unknown>): Promise<void> {
    const matchingRules = [...this.rules.values()].filter(
      (r) => r.tenantId === tenantId && r.trigger === event && r.isActive,
    );

    this.logger.log(`Event: ${event} | Matching rules: ${matchingRules.length}`);

    for (const rule of matchingRules) {
      if (this.evaluateConditions(rule, payload)) {
        await this.workflowQueue.add(
          'execute',
          { ruleId: rule.id, tenantId, trigger: event, payload, attempt: 1 },
          {
            attempts: 3,
            backoff: { type: 'exponential', delay: 2000 },
            removeOnComplete: 100,
            removeOnFail: 50,
          },
        );
        this.logger.log(`Queued rule execution: ${rule.name}`);
      }
    }
  }

  async executeRule(job: WorkflowJob): Promise<void> {
    const rule = this.rules.get(job.ruleId);
    if (!rule) {
      this.logger.warn(`Rule not found: ${job.ruleId}`);
      return;
    }

    this.logger.log(`Executing rule: ${rule.name} | Actions: ${rule.actions.length}`);

    for (const action of rule.actions) {
      await this.executeAction(action, job.payload, job.tenantId);
    }

    rule.executionCount += 1;
    rule.lastExecutedAt = new Date();
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkOverdueTasks(): Promise<void> {
    this.logger.log('Checking for overdue tasks...');
    // In production: query DB for tasks past dueAt, emit task.overdue events
  }

  @Cron('0 9 * * 1-5')
  async sendDailyDigest(): Promise<void> {
    this.logger.log('Sending daily digest to active tenants...');
    // In production: query active tenants, generate AI summaries, send emails
  }

  private evaluateConditions(rule: AutomationRule, payload: Record<string, unknown>): boolean {
    if (!rule.conditions?.length) return true;

    return rule.conditions.every(({ field, operator, value }) => {
      const fieldValue = this.getNestedValue(payload, field);
      switch (operator) {
        case 'eq': return fieldValue === value;
        case 'neq': return fieldValue !== value;
        case 'contains': return String(fieldValue).includes(String(value));
        case 'gt': return Number(fieldValue) > Number(value);
        case 'lt': return Number(fieldValue) < Number(value);
        default: return false;
      }
    });
  }

  private async executeAction(
    action: { type: ActionType; config: Record<string, unknown> },
    payload: Record<string, unknown>,
    tenantId: string,
  ): Promise<void> {
    this.logger.log(`Executing action: ${action.type}`);
    // Each action type dispatches to the appropriate service via HTTP or RabbitMQ
    // In production: use typed action handlers with dependency injection
    switch (action.type) {
      case 'send_email':
        this.logger.log(`[action:send_email] to=${action.config['to']}`);
        break;
      case 'create_task':
        this.logger.log(`[action:create_task] title=${action.config['title']}`);
        break;
      case 'send_webhook':
        this.logger.log(`[action:send_webhook] url=${action.config['url']}`);
        break;
      default:
        this.logger.warn(`Unknown action type: ${action.type}`);
    }
  }

  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((curr: unknown, key) => {
      return curr && typeof curr === 'object' ? (curr as Record<string, unknown>)[key] : undefined;
    }, obj);
  }
}
