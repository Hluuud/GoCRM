export type TenantPlan = 'starter' | 'professional' | 'enterprise';

export interface TenantSettings {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  currency?: string;
  dateFormat?: string;
  logoUrl?: string;
  customDomain?: string;
  features?: TenantFeatureFlags;
}

export interface TenantFeatureFlags {
  aiAssistant?: boolean;
  omnichannel?: boolean;
  financialModule?: boolean;
  projectManagement?: boolean;
  workflowAutomation?: boolean;
  apiAccess?: boolean;
  ssoEnabled?: boolean;
  auditLogs?: boolean;
  exportData?: boolean;
}

export interface TenantUsage {
  users: number;
  leads: number;
  contacts: number;
  storage: number; // bytes
  apiCallsThisMonth: number;
}

export interface CreateTenantDto {
  name: string;
  slug: string;
  plan: TenantPlan;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPassword: string;
}
