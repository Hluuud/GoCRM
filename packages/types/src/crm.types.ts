export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED' | 'LOST';
export type LeadSource = 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'COLD_CALL' | 'EMAIL_CAMPAIGN' | 'TRADE_SHOW' | 'PARTNER' | 'OTHER';
export type DealStage = 'PROSPECTING' | 'QUALIFICATION' | 'PROPOSAL' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface LeadFilters {
  status?: LeadStatus;
  source?: LeadSource;
  assigneeId?: string;
  companyId?: string;
  search?: string;
  minScore?: number;
  maxScore?: number;
  minValue?: number;
  maxValue?: number;
  createdFrom?: string;
  createdTo?: string;
}

export interface DealFilters {
  stage?: DealStage;
  assigneeId?: string;
  companyId?: string;
  contactId?: string;
  search?: string;
  minValue?: number;
  maxValue?: number;
}

export interface CrmStats {
  totalLeads: number;
  newLeadsThisPeriod: number;
  conversionRate: number;
  totalPipelineValue: number;
  openDeals: number;
  wonDealsThisPeriod: number;
  lostDealsThisPeriod: number;
}
