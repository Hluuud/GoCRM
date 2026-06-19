import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';

export interface WebhookPayload {
  event: string;
  data: Record<string, unknown>;
  tenantId: string;
  timestamp: string;
}

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  async dispatch(url: string, secret: string, payload: WebhookPayload): Promise<void> {
    const body = JSON.stringify(payload);
    const signature = this.sign(secret, body);

    try {
      await axios.post(url, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-NexCRM-Signature': signature,
          'X-NexCRM-Event': payload.event,
          'X-NexCRM-Timestamp': payload.timestamp,
        },
        timeout: 10_000,
      });
      this.logger.log(`Webhook dispatched: ${payload.event} → ${url}`);
    } catch (error) {
      this.logger.error(`Webhook failed: ${payload.event} → ${url}`, error.message);
      throw error;
    }
  }

  private sign(secret: string, body: string): string {
    return `sha256=${crypto.createHmac('sha256', secret).update(body).digest('hex')}`;
  }

  verify(secret: string, signature: string, body: string): boolean {
    const expected = this.sign(secret, body);
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  }
}
