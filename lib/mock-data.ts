// ── Types ──────────────────────────────────────────────────────────────────────

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done'
export type ConvStatus = 'open' | 'pending' | 'resolved' | 'closed'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue'
export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed'

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  role: 'admin' | 'manager' | 'agent' | 'viewer'
  department: string
  status: 'active' | 'away' | 'offline'
}

export interface Lead {
  id: string
  name: string
  company: string
  email: string
  phone: string
  status: LeadStatus
  value: number
  owner: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  company: string
  position: string
  avatar: string
  tags: string[]
  createdAt: string
}

export interface Deal {
  id: string
  title: string
  contact: string
  company: string
  value: number
  stage: LeadStatus
  probability: number
  closeDate: string
  owner: string
}

export interface Conversation {
  id: string
  contact: string
  channel: 'whatsapp' | 'telegram' | 'email' | 'chat'
  status: ConvStatus
  lastMessage: string
  lastMessageAt: string
  assignee: string
  unread: number
  tags: string[]
}

export interface Invoice {
  id: string
  number: string
  client: string
  amount: number
  status: InvoiceStatus
  dueDate: string
  issuedAt: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  progress: number
  team: string[]
  dueDate: string
  priority: TaskPriority
}

export interface Task {
  id: string
  title: string
  project: string
  assignee: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  tags: string[]
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

export const currentUser: User = {
  id: 'u-001',
  name: 'Rafael Mendes',
  email: 'rafael@nexcrm.io',
  avatar: 'RM',
  role: 'admin',
  department: 'Vendas',
  status: 'active',
}

export const teamMembers: User[] = [
  { id: 'u-001', name: 'Rafael Mendes', email: 'rafael@nexcrm.io', avatar: 'RM', role: 'admin', department: 'Vendas', status: 'active' },
  { id: 'u-002', name: 'Ana Souza', email: 'ana@nexcrm.io', avatar: 'AS', role: 'manager', department: 'Suporte', status: 'active' },
  { id: 'u-003', name: 'Carlos Lima', email: 'carlos@nexcrm.io', avatar: 'CL', role: 'agent', department: 'Vendas', status: 'away' },
  { id: 'u-004', name: 'Juliana Torres', email: 'juliana@nexcrm.io', avatar: 'JT', role: 'agent', department: 'Marketing', status: 'active' },
  { id: 'u-005', name: 'Felipe Rocha', email: 'felipe@nexcrm.io', avatar: 'FR', role: 'viewer', department: 'Jurídico', status: 'offline' },
]

export const leads: Lead[] = [
  { id: 'l-001', name: 'Marcos Pereira', company: 'TechCorp SA', email: 'marcos@techcorp.com', phone: '+55 11 99999-0001', status: 'qualified', value: 48000, owner: 'Rafael Mendes', tags: ['enterprise', 'saas'], createdAt: '2025-04-01', updatedAt: '2025-05-10' },
  { id: 'l-002', name: 'Priscila Nunes', company: 'Advocacia Nunes', email: 'priscila@nunes.adv.br', phone: '+55 11 99999-0002', status: 'proposal', value: 12000, owner: 'Ana Souza', tags: ['jurídico'], createdAt: '2025-04-10', updatedAt: '2025-05-09' },
  { id: 'l-003', name: 'Diego Castro', company: 'Logística Rápida', email: 'diego@logistica.com', phone: '+55 11 99999-0003', status: 'contacted', value: 24000, owner: 'Carlos Lima', tags: ['logistics'], createdAt: '2025-04-15', updatedAt: '2025-05-08' },
  { id: 'l-004', name: 'Fernanda Alves', company: 'Alves & Cia', email: 'fernanda@alves.com', phone: '+55 11 99999-0004', status: 'new', value: 8500, owner: 'Rafael Mendes', tags: ['smb'], createdAt: '2025-04-20', updatedAt: '2025-05-07' },
  { id: 'l-005', name: 'Roberto Faria', company: 'InovaTech', email: 'roberto@inovatech.com', phone: '+55 11 99999-0005', status: 'won', value: 62000, owner: 'Ana Souza', tags: ['enterprise'], createdAt: '2025-03-15', updatedAt: '2025-05-05' },
  { id: 'l-006', name: 'Camila Braga', company: 'Saúde Total', email: 'camila@saudetotal.com', phone: '+55 11 99999-0006', status: 'lost', value: 15000, owner: 'Carlos Lima', tags: ['health'], createdAt: '2025-03-20', updatedAt: '2025-05-01' },
  { id: 'l-007', name: 'Thiago Melo', company: 'Melo Construções', email: 'thiago@melo.com', phone: '+55 11 99999-0007', status: 'qualified', value: 35000, owner: 'Juliana Torres', tags: ['construction'], createdAt: '2025-04-25', updatedAt: '2025-05-11' },
  { id: 'l-008', name: 'Beatriz Santos', company: 'EduTech BR', email: 'beatriz@edutech.com.br', phone: '+55 11 99999-0008', status: 'contacted', value: 19000, owner: 'Rafael Mendes', tags: ['education'], createdAt: '2025-04-28', updatedAt: '2025-05-10' },
]

export const contacts: Contact[] = [
  { id: 'c-001', name: 'Marcos Pereira', email: 'marcos@techcorp.com', phone: '+55 11 99999-0001', company: 'TechCorp SA', position: 'CTO', avatar: 'MP', tags: ['enterprise'], createdAt: '2025-01-10' },
  { id: 'c-002', name: 'Priscila Nunes', email: 'priscila@nunes.adv.br', phone: '+55 11 99999-0002', company: 'Advocacia Nunes', position: 'Sócia', avatar: 'PN', tags: ['jurídico'], createdAt: '2025-01-15' },
  { id: 'c-003', name: 'Diego Castro', email: 'diego@logistica.com', phone: '+55 11 99999-0003', company: 'Logística Rápida', position: 'Diretor Comercial', avatar: 'DC', tags: ['logistics'], createdAt: '2025-02-01' },
  { id: 'c-004', name: 'Fernanda Alves', email: 'fernanda@alves.com', phone: '+55 11 99999-0004', company: 'Alves & Cia', position: 'CEO', avatar: 'FA', tags: ['smb'], createdAt: '2025-02-10' },
  { id: 'c-005', name: 'Roberto Faria', email: 'roberto@inovatech.com', phone: '+55 11 99999-0005', company: 'InovaTech', position: 'VP de Vendas', avatar: 'RF', tags: ['enterprise'], createdAt: '2025-02-15' },
]

export const deals: Deal[] = [
  { id: 'd-001', title: 'Plano Enterprise TechCorp', contact: 'Marcos Pereira', company: 'TechCorp SA', value: 48000, stage: 'proposal', probability: 75, closeDate: '2025-06-15', owner: 'Rafael Mendes' },
  { id: 'd-002', title: 'Sistema Jurídico Nunes', contact: 'Priscila Nunes', company: 'Advocacia Nunes', value: 12000, stage: 'qualified', probability: 60, closeDate: '2025-06-30', owner: 'Ana Souza' },
  { id: 'd-003', title: 'CRM Logística Rápida', contact: 'Diego Castro', company: 'Logística Rápida', value: 24000, stage: 'contacted', probability: 30, closeDate: '2025-07-10', owner: 'Carlos Lima' },
  { id: 'd-004', title: 'Expansão InovaTech', contact: 'Roberto Faria', company: 'InovaTech', value: 62000, stage: 'won', probability: 100, closeDate: '2025-05-01', owner: 'Ana Souza' },
  { id: 'd-005', title: 'Módulo EduTech', contact: 'Beatriz Santos', company: 'EduTech BR', value: 19000, stage: 'new', probability: 20, closeDate: '2025-07-30', owner: 'Rafael Mendes' },
]

export const conversations: Conversation[] = [
  { id: 'cv-001', contact: 'Marcos Pereira', channel: 'whatsapp', status: 'open', lastMessage: 'Pode me enviar a proposta revisada?', lastMessageAt: '2025-05-12T10:30:00', assignee: 'Rafael Mendes', unread: 2, tags: ['vendas'] },
  { id: 'cv-002', contact: 'Priscila Nunes', channel: 'email', status: 'pending', lastMessage: 'Aguardando retorno sobre cláusulas contratuais.', lastMessageAt: '2025-05-12T09:15:00', assignee: 'Ana Souza', unread: 0, tags: ['jurídico'] },
  { id: 'cv-003', contact: 'Diego Castro', channel: 'chat', status: 'open', lastMessage: 'Qual o prazo de implementação?', lastMessageAt: '2025-05-12T08:45:00', assignee: 'Carlos Lima', unread: 1, tags: ['suporte'] },
  { id: 'cv-004', contact: 'Beatriz Santos', channel: 'telegram', status: 'resolved', lastMessage: 'Ótimo! Vou confirmar internamente.', lastMessageAt: '2025-05-11T16:00:00', assignee: 'Juliana Torres', unread: 0, tags: ['vendas'] },
]

export const invoices: Invoice[] = [
  { id: 'i-001', number: 'NF-2025-001', client: 'InovaTech', amount: 62000, status: 'paid', dueDate: '2025-05-01', issuedAt: '2025-04-01' },
  { id: 'i-002', number: 'NF-2025-002', client: 'TechCorp SA', amount: 48000, status: 'sent', dueDate: '2025-06-15', issuedAt: '2025-05-01' },
  { id: 'i-003', number: 'NF-2025-003', client: 'Advocacia Nunes', amount: 12000, status: 'draft', dueDate: '2025-06-30', issuedAt: '2025-05-10' },
  { id: 'i-004', number: 'NF-2025-004', client: 'Logística Rápida', amount: 24000, status: 'overdue', dueDate: '2025-04-30', issuedAt: '2025-03-30' },
  { id: 'i-005', number: 'NF-2025-005', client: 'EduTech BR', amount: 19000, status: 'sent', dueDate: '2025-07-10', issuedAt: '2025-05-12' },
]

export const projects: Project[] = [
  { id: 'p-001', name: 'Implementação TechCorp', description: 'Onboarding e configuração do ambiente enterprise para TechCorp SA.', status: 'active', progress: 65, team: ['Rafael Mendes', 'Ana Souza'], dueDate: '2025-06-30', priority: 'high' },
  { id: 'p-002', name: 'Módulo Jurídico v2', description: 'Desenvolvimento do módulo de gestão jurídica com automações.', status: 'active', progress: 40, team: ['Carlos Lima', 'Juliana Torres'], dueDate: '2025-07-15', priority: 'medium' },
  { id: 'p-003', name: 'Portal do Cliente', description: 'Portal self-service para clientes acompanharem processos.', status: 'planning', progress: 10, team: ['Rafael Mendes'], dueDate: '2025-08-01', priority: 'medium' },
  { id: 'p-004', name: 'Integração ERP Logística', description: 'Integração bidirecional com ERP da Logística Rápida.', status: 'on_hold', progress: 25, team: ['Felipe Rocha', 'Carlos Lima'], dueDate: '2025-07-30', priority: 'low' },
]

export const tasks: Task[] = [
  { id: 't-001', title: 'Enviar proposta revisada TechCorp', project: 'Implementação TechCorp', assignee: 'Rafael Mendes', status: 'in_progress', priority: 'high', dueDate: '2025-05-14', tags: ['vendas'] },
  { id: 't-002', title: 'Revisar cláusulas contratuais Nunes', project: 'Módulo Jurídico v2', assignee: 'Ana Souza', status: 'todo', priority: 'medium', dueDate: '2025-05-15', tags: ['jurídico'] },
  { id: 't-003', title: 'Configurar ambiente de homologação', project: 'Implementação TechCorp', assignee: 'Carlos Lima', status: 'review', priority: 'high', dueDate: '2025-05-13', tags: ['técnico'] },
  { id: 't-004', title: 'Criar wireframes portal do cliente', project: 'Portal do Cliente', assignee: 'Juliana Torres', status: 'done', priority: 'medium', dueDate: '2025-05-10', tags: ['design'] },
  { id: 't-005', title: 'Mapear endpoints ERP', project: 'Integração ERP Logística', assignee: 'Felipe Rocha', status: 'todo', priority: 'low', dueDate: '2025-05-20', tags: ['técnico'] },
  { id: 't-006', title: 'Onboarding equipe EduTech', project: 'Portal do Cliente', assignee: 'Rafael Mendes', status: 'todo', priority: 'medium', dueDate: '2025-05-16', tags: ['educação'] },
]

// ── KPI / Chart Data ──────────────────────────────────────────────────────────

export const revenueData = [
  { month: 'Jan', receita: 42000, meta: 50000 },
  { month: 'Fev', receita: 58000, meta: 50000 },
  { month: 'Mar', receita: 47000, meta: 55000 },
  { month: 'Abr', receita: 71000, meta: 55000 },
  { month: 'Mai', receita: 65000, meta: 60000 },
  { month: 'Jun', receita: 80000, meta: 60000 },
  { month: 'Jul', receita: 76000, meta: 65000 },
  { month: 'Ago', receita: 90000, meta: 65000 },
  { month: 'Set', receita: 84000, meta: 70000 },
  { month: 'Out', receita: 96000, meta: 70000 },
  { month: 'Nov', receita: 108000, meta: 75000 },
  { month: 'Dez', receita: 124000, meta: 75000 },
]

export const leadsConversionData = [
  { stage: 'Novos', value: 120 },
  { stage: 'Contatados', value: 90 },
  { stage: 'Qualificados', value: 60 },
  { stage: 'Proposta', value: 35 },
  { stage: 'Ganhos', value: 22 },
]

export const ticketsData = [
  { day: 'Seg', abertos: 12, resolvidos: 10 },
  { day: 'Ter', abertos: 18, resolvidos: 15 },
  { day: 'Qua', abertos: 9, resolvidos: 12 },
  { day: 'Qui', abertos: 22, resolvidos: 18 },
  { day: 'Sex', abertos: 14, resolvidos: 20 },
  { day: 'Sáb', abertos: 5, resolvidos: 7 },
  { day: 'Dom', abertos: 3, resolvidos: 4 },
]

export const teamPerformance = [
  { name: 'Rafael Mendes', leads: 28, deals: 12, revenue: 210000 },
  { name: 'Ana Souza', leads: 22, deals: 9, revenue: 175000 },
  { name: 'Carlos Lima', leads: 18, deals: 7, revenue: 130000 },
  { name: 'Juliana Torres', leads: 15, deals: 5, revenue: 95000 },
  { name: 'Felipe Rocha', leads: 10, deals: 3, revenue: 60000 },
]
