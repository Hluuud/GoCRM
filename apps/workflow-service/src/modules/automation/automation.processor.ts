import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { AutomationService, WorkflowJob } from './automation.service';

@Processor('workflow')
export class AutomationProcessor {
  private readonly logger = new Logger(AutomationProcessor.name);

  constructor(private readonly automationService: AutomationService) {}

  @Process('execute')
  async handleExecution(job: Job<WorkflowJob>): Promise<void> {
    this.logger.log(`Processing job ${job.id} | Rule: ${job.data.ruleId} | Attempt: ${job.attemptsMade + 1}`);
    try {
      await this.automationService.executeRule(job.data);
    } catch (error) {
      this.logger.error(`Job ${job.id} failed: ${error.message}`, error.stack);
      throw error; // Bull will retry based on attempts config
    }
  }
}
