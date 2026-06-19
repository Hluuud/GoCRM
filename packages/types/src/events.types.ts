/**
 * Contratos de mensagens RabbitMQ.
 * Cada serviço publica e consome estes tipos definidos aqui centralmente.
 * Exchange: nexcrm.topic (topic exchange)
 * Routing key pattern: <service>.<entity>.<action>
 */

// ── CRM Events ───────────────────────────────────────────────────
export interface LeadCreatedEvent {
  tenantId: string;
  leadId: string;
  assigneeId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  source: string;
  estimatedValue?: number;
  createdAt: string;
}

export interface LeadStatusChangedEvent {
  tenantId: string;
  leadId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
}

export interface DealStageChangedEvent {
  tenantId: string;
  dealId: string;
  title: string;
  previousStage: string;
  newStage: string;
  value: number;
  currency: string;
  changedBy: string;
  changedAt: string;
}

export interface DealWonEvent {
  tenantId: string;
  dealId: string;
  title: string;
  value: number;
  currency: string;
  assigneeId?: string;
  closedAt: string;
}

export interface DealLostEvent {
  tenantId: string;
  dealId: string;
  title: string;
  value: number;
  lostReason?: string;
  closedAt: string;
}

export interface TaskCompletedEvent {
  tenantId: string;
  taskId: string;
  title: string;
  assigneeId?: string;
  projectId?: string;
  completedAt: string;
}

// ── Finance Events ────────────────────────────────────────────────
export interface InvoiceCreatedEvent {
  tenantId: string;
  invoiceId: string;
  number: string;
  contactId?: string;
  total: number;
  currency: string;
  dueDate: string;
  createdAt: string;
}

export interface InvoicePaidEvent {
  tenantId: string;
  invoiceId: string;
  number: string;
  total: number;
  currency: string;
  paidAt: string;
}

export interface InvoiceOverdueEvent {
  tenantId: string;
  invoiceId: string;
  number: string;
  total: number;
  currency: string;
  dueDate: string;
  daysOverdue: number;
}

// ── Omnichannel Events ────────────────────────────────────────────
export interface ConversationOpenedEvent {
  tenantId: string;
  conversationId: string;
  contactId?: string;
  channel: string;
  openedAt: string;
}

export interface ConversationClosedEvent {
  tenantId: string;
  conversationId: string;
  assigneeId?: string;
  closedAt: string;
  resolutionTime?: number; // seconds
}

export interface MessageReceivedEvent {
  tenantId: string;
  conversationId: string;
  messageId: string;
  channel: string;
  contactId?: string;
  body?: string;
  receivedAt: string;
}

// ── Auth Events ───────────────────────────────────────────────────
export interface UserRegisteredEvent {
  tenantId: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  registeredAt: string;
}

export interface UserPasswordResetEvent {
  userId: string;
  email: string;
  ipAddress?: string;
  requestedAt: string;
}

// ── AI Events ─────────────────────────────────────────────────────
export interface AiSummaryRequestedEvent {
  tenantId: string;
  requestId: string;
  entityType: 'lead' | 'deal' | 'contact' | 'conversation';
  entityId: string;
  requestedBy: string;
  requestedAt: string;
}

// ── Routing keys ─────────────────────────────────────────────────
export const ROUTING_KEYS = {
  LEAD_CREATED: 'crm.lead.created',
  LEAD_STATUS_CHANGED: 'crm.lead.status_changed',
  DEAL_STAGE_CHANGED: 'crm.deal.stage_changed',
  DEAL_WON: 'crm.deal.won',
  DEAL_LOST: 'crm.deal.lost',
  TASK_COMPLETED: 'crm.task.completed',
  INVOICE_CREATED: 'finance.invoice.created',
  INVOICE_PAID: 'finance.invoice.paid',
  INVOICE_OVERDUE: 'finance.invoice.overdue',
  CONVERSATION_OPENED: 'omnichannel.conversation.opened',
  CONVERSATION_CLOSED: 'omnichannel.conversation.closed',
  MESSAGE_RECEIVED: 'omnichannel.message.received',
  USER_REGISTERED: 'auth.user.registered',
  USER_PASSWORD_RESET: 'auth.user.password_reset',
  AI_SUMMARY_REQUESTED: 'ai.summary.requested',
} as const;

export type RoutingKey = (typeof ROUTING_KEYS)[keyof typeof ROUTING_KEYS];
