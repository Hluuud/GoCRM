import { PrismaClient, LeadStatus, LeadSource, DealStage, TaskStatus, TaskPriority, ProjectStatus, InvoiceStatus, MembershipStatus } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  // In production, use bcrypt. This is seed-only.
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  console.log('Iniciando seed do banco de dados NexCRM...');

  // ── Cleanup ──────────────────────────────────────────────────
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.workflowExecution.deleteMany();
  await prisma.workflow.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.task.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.leadTag.deleteMany();
  await prisma.contactTag.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.project.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.session.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // ── Tenant ───────────────────────────────────────────────────
  const tenant = await prisma.tenant.create({
    data: {
      name: 'NexCRM Enterprise',
      slug: 'nexcrm-enterprise',
      plan: 'enterprise',
      settings: { theme: 'dark', language: 'pt-BR', timezone: 'America/Sao_Paulo' },
    },
  });

  const tenant2 = await prisma.tenant.create({
    data: {
      name: 'Advocacia Nunes & Associados',
      slug: 'advocacia-nunes',
      plan: 'professional',
    },
  });

  // ── Permissions ───────────────────────────────────────────────
  const resources = ['leads', 'contacts', 'companies', 'deals', 'tasks', 'invoices', 'projects', 'reports', 'users', 'settings'];
  const actions = ['create', 'read', 'update', 'delete', 'export'];

  const permissions = await Promise.all(
    resources.flatMap((resource) =>
      actions.map((action) =>
        prisma.permission.create({ data: { resource, action, description: `${action} ${resource}` } })
      )
    )
  );

  // ── Roles ─────────────────────────────────────────────────────
  const adminRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: 'Admin',
      description: 'Acesso completo a todos os recursos',
      isSystem: true,
      permissions: {
        create: permissions.map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const managerRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: 'Gerente',
      description: 'Gerenciamento de CRM e relatórios',
      isSystem: true,
      permissions: {
        create: permissions
          .filter((p) => ['leads', 'contacts', 'companies', 'deals', 'tasks', 'invoices', 'projects'].includes(p.resource))
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  const agentRole = await prisma.role.create({
    data: {
      tenantId: tenant.id,
      name: 'Agente',
      description: 'Operações de vendas e atendimento',
      isSystem: true,
      permissions: {
        create: permissions
          .filter((p) => ['leads', 'contacts', 'deals', 'tasks'].includes(p.resource) && ['create', 'read', 'update'].includes(p.action))
          .map((p) => ({ permissionId: p.id })),
      },
    },
  });

  // ── Users ─────────────────────────────────────────────────────
  const superAdmin = await prisma.user.create({
    data: {
      email: 'rafael@nexcrm.io',
      passwordHash: hashPassword('NexCRM@2024!'),
      firstName: 'Rafael',
      lastName: 'Mendes',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      mfaEnabled: true,
      lastLoginAt: new Date(),
      lastLoginIp: '200.184.10.22',
      loginCount: 47,
      memberships: {
        create: { tenantId: tenant.id, roleId: adminRole.id, status: MembershipStatus.ACTIVE, joinedAt: new Date() },
      },
    },
  });

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'carla@nexcrm.io',
        passwordHash: hashPassword('Carla@2024'),
        firstName: 'Carla',
        lastName: 'Souza',
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        memberships: { create: { tenantId: tenant.id, roleId: managerRole.id, status: MembershipStatus.ACTIVE, joinedAt: new Date() } },
      },
    }),
    prisma.user.create({
      data: {
        email: 'lucas@nexcrm.io',
        passwordHash: hashPassword('Lucas@2024'),
        firstName: 'Lucas',
        lastName: 'Ferreira',
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        memberships: { create: { tenantId: tenant.id, roleId: agentRole.id, status: MembershipStatus.ACTIVE, joinedAt: new Date() } },
      },
    }),
    prisma.user.create({
      data: {
        email: 'ana@nexcrm.io',
        passwordHash: hashPassword('Ana@2024'),
        firstName: 'Ana',
        lastName: 'Costa',
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        memberships: { create: { tenantId: tenant.id, roleId: agentRole.id, status: MembershipStatus.ACTIVE, joinedAt: new Date() } },
      },
    }),
    prisma.user.create({
      data: {
        email: 'marcos@nexcrm.io',
        passwordHash: hashPassword('Marcos@2024'),
        firstName: 'Marcos',
        lastName: 'Lima',
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        memberships: { create: { tenantId: tenant.id, roleId: agentRole.id, status: MembershipStatus.ACTIVE, joinedAt: new Date() } },
      },
    }),
  ]);

  const [carla, lucas, ana, marcos] = users;

  // ── Tags ──────────────────────────────────────────────────────
  const tagVip = await prisma.tag.create({ data: { tenantId: tenant.id, name: 'VIP', color: '#F59E0B' } });
  const tagEnterprise = await prisma.tag.create({ data: { tenantId: tenant.id, name: 'Enterprise', color: '#3B82F6' } });
  const tagUrgente = await prisma.tag.create({ data: { tenantId: tenant.id, name: 'Urgente', color: '#EF4444' } });
  const tagParceiro = await prisma.tag.create({ data: { tenantId: tenant.id, name: 'Parceiro', color: '#10B981' } });

  // ── Companies ─────────────────────────────────────────────────
  const companies = await Promise.all([
    prisma.company.create({ data: { tenantId: tenant.id, name: 'TechStart Soluções', domain: 'techstart.com.br', industry: 'Tecnologia', size: '51-200', website: 'https://techstart.com.br' } }),
    prisma.company.create({ data: { tenantId: tenant.id, name: 'Global Varejo S.A.', domain: 'globalvarejo.com.br', industry: 'Varejo', size: '201-1000', revenue: 15000000 } }),
    prisma.company.create({ data: { tenantId: tenant.id, name: 'Advocacia Pires & Lima', domain: 'pireslimaadv.com.br', industry: 'Jurídico', size: '11-50' } }),
    prisma.company.create({ data: { tenantId: tenant.id, name: 'EduTech Aprendizado', domain: 'edutech.io', industry: 'Educação', size: '11-50' } }),
    prisma.company.create({ data: { tenantId: tenant.id, name: 'LogiMax Transportes', domain: 'logimax.com.br', industry: 'Logística', size: '51-200' } }),
  ]);

  // ── Contacts ─────────────────────────────────────────────────
  const contacts = await Promise.all([
    prisma.contact.create({ data: { tenantId: tenant.id, companyId: companies[0].id, firstName: 'Fernanda', lastName: 'Alves', email: 'fernanda@techstart.com.br', phone: '(11) 98765-4321', jobTitle: 'CEO' } }),
    prisma.contact.create({ data: { tenantId: tenant.id, companyId: companies[1].id, firstName: 'Bruno', lastName: 'Carvalho', email: 'bruno@globalvarejo.com.br', phone: '(21) 99887-6543', jobTitle: 'Diretor de Compras' } }),
    prisma.contact.create({ data: { tenantId: tenant.id, companyId: companies[2].id, firstName: 'Patricia', lastName: 'Nunes', email: 'patricia@pireslimaadv.com.br', phone: '(31) 98877-5544', jobTitle: 'Sócia' } }),
    prisma.contact.create({ data: { tenantId: tenant.id, companyId: companies[3].id, firstName: 'Diego', lastName: 'Santos', email: 'diego@edutech.io', phone: '(51) 99765-4433', jobTitle: 'CTO' } }),
    prisma.contact.create({ data: { tenantId: tenant.id, companyId: companies[4].id, firstName: 'Juliana', lastName: 'Rocha', email: 'juliana@logimax.com.br', phone: '(47) 98654-3322', jobTitle: 'Gerente Operacional' } }),
  ]);

  // ── Leads ─────────────────────────────────────────────────────
  const leads = await Promise.all([
    prisma.lead.create({ data: { tenantId: tenant.id, assigneeId: lucas.id, companyId: companies[0].id, firstName: 'Pedro', lastName: 'Oliveira', email: 'pedro@techstart.com.br', status: LeadStatus.QUALIFIED, source: LeadSource.WEBSITE, estimatedValue: 48000, score: 85, tags: { create: [{ tagId: tagEnterprise.id }] } } }),
    prisma.lead.create({ data: { tenantId: tenant.id, assigneeId: ana.id, companyId: companies[1].id, firstName: 'Sophia', lastName: 'Martins', email: 'sophia@globalvarejo.com.br', status: LeadStatus.CONTACTED, source: LeadSource.REFERRAL, estimatedValue: 120000, score: 72, tags: { create: [{ tagId: tagVip.id }, { tagId: tagEnterprise.id }] } } }),
    prisma.lead.create({ data: { tenantId: tenant.id, assigneeId: marcos.id, firstName: 'Thiago', lastName: 'Barbosa', email: 'thiago@startup.io', status: LeadStatus.NEW, source: LeadSource.SOCIAL_MEDIA, estimatedValue: 18000, score: 40 } }),
    prisma.lead.create({ data: { tenantId: tenant.id, assigneeId: lucas.id, companyId: companies[3].id, firstName: 'Camila', lastName: 'Freitas', email: 'camila@edutech.io', status: LeadStatus.CONVERTED, source: LeadSource.EMAIL_CAMPAIGN, estimatedValue: 35000, score: 90, convertedAt: new Date() } }),
    prisma.lead.create({ data: { tenantId: tenant.id, assigneeId: ana.id, firstName: 'Roberto', lastName: 'Melo', email: 'roberto@empresa.com.br', status: LeadStatus.UNQUALIFIED, source: LeadSource.COLD_CALL, estimatedValue: 5000, score: 20 } }),
    prisma.lead.create({ data: { tenantId: tenant.id, assigneeId: marcos.id, companyId: companies[4].id, firstName: 'Larissa', lastName: 'Teixeira', email: 'larissa@logimax.com.br', status: LeadStatus.CONTACTED, source: LeadSource.PARTNER, estimatedValue: 67000, score: 65, tags: { create: [{ tagId: tagParceiro.id }] } } }),
    prisma.lead.create({ data: { tenantId: tenant.id, assigneeId: lucas.id, firstName: 'Felipe', lastName: 'Gonçalves', email: 'felipe@consultora.com', status: LeadStatus.NEW, source: LeadSource.TRADE_SHOW, estimatedValue: 25000, score: 55, tags: { create: [{ tagId: tagUrgente.id }] } } }),
    prisma.lead.create({ data: { tenantId: tenant.id, assigneeId: ana.id, firstName: 'Isabela', lastName: 'Moreira', email: 'isabela@grupo.com.br', status: LeadStatus.QUALIFIED, source: LeadSource.WEBSITE, estimatedValue: 92000, score: 78 } }),
  ]);

  // ── Deals ─────────────────────────────────────────────────────
  const deals = await Promise.all([
    prisma.deal.create({ data: { tenantId: tenant.id, assigneeId: lucas.id, contactId: contacts[0].id, companyId: companies[0].id, title: 'Implantação CRM Enterprise', stage: DealStage.PROPOSAL, value: 48000, probability: 65, expectedCloseDate: new Date('2024-08-30') } }),
    prisma.deal.create({ data: { tenantId: tenant.id, assigneeId: ana.id, contactId: contacts[1].id, companyId: companies[1].id, title: 'Licença Anual Global Varejo', stage: DealStage.NEGOTIATION, value: 120000, probability: 80, expectedCloseDate: new Date('2024-07-31') } }),
    prisma.deal.create({ data: { tenantId: tenant.id, assigneeId: marcos.id, contactId: contacts[2].id, companyId: companies[2].id, title: 'Módulo Jurídico — Advocacia Pires', stage: DealStage.QUALIFICATION, value: 24000, probability: 45, expectedCloseDate: new Date('2024-09-15') } }),
    prisma.deal.create({ data: { tenantId: tenant.id, assigneeId: lucas.id, contactId: contacts[3].id, companyId: companies[3].id, title: 'EduTech — Plataforma Completa', stage: DealStage.CLOSED_WON, value: 35000, probability: 100, closedAt: new Date() } }),
    prisma.deal.create({ data: { tenantId: tenant.id, assigneeId: ana.id, contactId: contacts[4].id, companyId: companies[4].id, title: 'LogiMax — Gestão de Frotas + CRM', stage: DealStage.PROSPECTING, value: 67000, probability: 30, expectedCloseDate: new Date('2024-10-01') } }),
  ]);

  // ── Projects ──────────────────────────────────────────────────
  const projects = await Promise.all([
    prisma.project.create({ data: { tenantId: tenant.id, name: 'Migração de Dados Legacy', status: ProjectStatus.ACTIVE, progress: 62, startDate: new Date('2024-05-01'), endDate: new Date('2024-07-31'), budget: 45000 } }),
    prisma.project.create({ data: { tenantId: tenant.id, name: 'Integração API WhatsApp', status: ProjectStatus.ACTIVE, progress: 38, startDate: new Date('2024-06-01'), endDate: new Date('2024-08-15'), budget: 28000 } }),
    prisma.project.create({ data: { tenantId: tenant.id, name: 'Redesign Portal do Cliente', status: ProjectStatus.PLANNING, progress: 10, startDate: new Date('2024-07-15'), endDate: new Date('2024-10-30'), budget: 62000 } }),
    prisma.project.create({ data: { tenantId: tenant.id, name: 'Implementação Módulo BI', status: ProjectStatus.ON_HOLD, progress: 25, startDate: new Date('2024-04-01'), endDate: new Date('2024-09-30'), budget: 80000 } }),
  ]);

  // ── Tasks ─────────────────────────────────────────────────────
  await Promise.all([
    prisma.task.create({ data: { tenantId: tenant.id, creatorId: superAdmin.id, assigneeId: lucas.id, projectId: projects[0].id, title: 'Mapeamento de tabelas legadas', status: TaskStatus.DONE, priority: TaskPriority.HIGH, completedAt: new Date() } }),
    prisma.task.create({ data: { tenantId: tenant.id, creatorId: superAdmin.id, assigneeId: ana.id, projectId: projects[0].id, title: 'Script de migração de clientes', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, dueDate: new Date('2024-07-15') } }),
    prisma.task.create({ data: { tenantId: tenant.id, creatorId: carla.id, assigneeId: marcos.id, projectId: projects[1].id, title: 'Configurar webhook WhatsApp Business', status: TaskStatus.TODO, priority: TaskPriority.URGENT, dueDate: new Date('2024-07-20') } }),
    prisma.task.create({ data: { tenantId: tenant.id, creatorId: carla.id, assigneeId: lucas.id, projectId: projects[1].id, title: 'Implementar parser de mensagens', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, dueDate: new Date('2024-07-25') } }),
    prisma.task.create({ data: { tenantId: tenant.id, creatorId: superAdmin.id, assigneeId: ana.id, title: 'Follow-up Pedro Oliveira — TechStart', status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, dueDate: new Date('2024-07-12') } }),
    prisma.task.create({ data: { tenantId: tenant.id, creatorId: superAdmin.id, assigneeId: marcos.id, title: 'Preparar proposta LogiMax', status: TaskStatus.IN_REVIEW, priority: TaskPriority.HIGH, dueDate: new Date('2024-07-14') } }),
  ]);

  // ── Conversations ─────────────────────────────────────────────
  const conversations = await Promise.all([
    prisma.conversation.create({ data: { tenantId: tenant.id, contactId: contacts[0].id, assigneeId: lucas.id, channel: 'WHATSAPP', status: 'IN_PROGRESS', lastMessageAt: new Date() } }),
    prisma.conversation.create({ data: { tenantId: tenant.id, contactId: contacts[1].id, assigneeId: ana.id, channel: 'EMAIL', status: 'OPEN', lastMessageAt: new Date() } }),
    prisma.conversation.create({ data: { tenantId: tenant.id, contactId: contacts[2].id, assigneeId: marcos.id, channel: 'TELEGRAM', status: 'RESOLVED', resolvedAt: new Date(), lastMessageAt: new Date() } }),
    prisma.conversation.create({ data: { tenantId: tenant.id, contactId: contacts[3].id, assigneeId: lucas.id, channel: 'CHAT', status: 'OPEN', lastMessageAt: new Date() } }),
  ]);

  await prisma.message.createMany({
    data: [
      { conversationId: conversations[0].id, direction: 'INBOUND', body: 'Olá, gostaria de saber mais sobre os planos enterprise.', createdAt: new Date(Date.now() - 3600000) },
      { conversationId: conversations[0].id, senderId: lucas.id, direction: 'OUTBOUND', body: 'Olá Fernanda! Claro, ficarei feliz em apresentar nossas soluções enterprise. Você tem disponibilidade para uma chamada amanhã às 14h?', createdAt: new Date(Date.now() - 3000000) },
      { conversationId: conversations[0].id, direction: 'INBOUND', body: 'Perfeito, amanhã às 14h funciona muito bem!', createdAt: new Date(Date.now() - 1800000) },
    ],
  });

  // ── Invoices ─────────────────────────────────────────────────
  await Promise.all([
    prisma.invoice.create({ data: { tenantId: tenant.id, number: 'NF-2024-001', status: InvoiceStatus.PAID, issueDate: new Date('2024-05-01'), dueDate: new Date('2024-05-31'), paidAt: new Date('2024-05-28'), subtotal: 12000, total: 12000, items: JSON.parse('[{"desc":"Licença Mensal NexCRM Enterprise","qty":1,"unit":12000,"total":12000}]') } }),
    prisma.invoice.create({ data: { tenantId: tenant.id, number: 'NF-2024-002', status: InvoiceStatus.PAID, issueDate: new Date('2024-06-01'), dueDate: new Date('2024-06-30'), paidAt: new Date('2024-06-25'), subtotal: 35000, total: 35000, items: JSON.parse('[{"desc":"Implantação EduTech","qty":1,"unit":35000,"total":35000}]') } }),
    prisma.invoice.create({ data: { tenantId: tenant.id, number: 'NF-2024-003', status: InvoiceStatus.SENT, issueDate: new Date('2024-07-01'), dueDate: new Date('2024-07-31'), subtotal: 48000, total: 48000, items: JSON.parse('[{"desc":"Proposta TechStart Enterprise","qty":1,"unit":48000,"total":48000}]') } }),
    prisma.invoice.create({ data: { tenantId: tenant.id, number: 'NF-2024-004', status: InvoiceStatus.OVERDUE, issueDate: new Date('2024-05-15'), dueDate: new Date('2024-06-15'), subtotal: 24000, total: 24000, items: JSON.parse('[{"desc":"Módulo Jurídico — Pires & Lima","qty":1,"unit":24000,"total":24000}]') } }),
    prisma.invoice.create({ data: { tenantId: tenant.id, number: 'NF-2024-005', status: InvoiceStatus.DRAFT, issueDate: new Date('2024-07-10'), dueDate: new Date('2024-08-10'), subtotal: 67000, total: 67000, items: JSON.parse('[{"desc":"LogiMax — Gestão Completa","qty":1,"unit":67000,"total":67000}]') } }),
  ]);

  // ── Workflows ─────────────────────────────────────────────────
  await Promise.all([
    prisma.workflow.create({ data: { tenantId: tenant.id, name: 'Notificar agente ao receber novo lead', trigger: 'LEAD_CREATED', status: 'ACTIVE', conditions: JSON.parse('[]'), actions: JSON.parse('[{"type":"SEND_NOTIFICATION","config":{"message":"Novo lead recebido: {{lead.name}}"}}]'), runCount: 23 } }),
    prisma.workflow.create({ data: { tenantId: tenant.id, name: 'Criar task de follow-up ao ganhar deal', trigger: 'DEAL_WON', status: 'ACTIVE', conditions: JSON.parse('[]'), actions: JSON.parse('[{"type":"CREATE_TASK","config":{"title":"Follow-up pós-venda: {{deal.title}}","dueInDays":3}}]'), runCount: 7 } }),
    prisma.workflow.create({ data: { tenantId: tenant.id, name: 'Alerta de fatura vencida', trigger: 'INVOICE_OVERDUE', status: 'ACTIVE', conditions: JSON.parse('[]'), actions: JSON.parse('[{"type":"SEND_EMAIL","config":{"template":"invoice_overdue","to":"{{invoice.contactEmail}}"}},{"type":"SEND_NOTIFICATION","config":{"message":"Fatura {{invoice.number}} vencida!"}}]'), runCount: 4 } }),
  ]);

  // ── Notifications ─────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      { tenantId: tenant.id, userId: superAdmin.id, type: 'INFO', title: 'Novo lead qualificado', body: 'Pedro Oliveira da TechStart foi qualificado.' },
      { tenantId: tenant.id, userId: superAdmin.id, type: 'SUCCESS', title: 'Deal fechado!', body: 'EduTech — Plataforma Completa (R$ 35.000) foi ganho.' },
      { tenantId: tenant.id, userId: superAdmin.id, type: 'WARNING', title: 'Fatura vencida', body: 'NF-2024-004 está vencida há 22 dias.' },
      { tenantId: tenant.id, userId: lucas.id, type: 'INFO', title: 'Nova mensagem', body: 'Fernanda Alves confirmou a reunião para amanhã.' },
    ],
  });

  // ── Audit Logs ────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      { tenantId: tenant.id, userId: superAdmin.id, action: 'LOGIN', resource: 'session', ipAddress: '200.184.10.22' },
      { tenantId: tenant.id, userId: superAdmin.id, action: 'CREATE', resource: 'lead', resourceId: leads[0].id, newValues: { firstName: 'Pedro', status: 'QUALIFIED' } },
      { tenantId: tenant.id, userId: lucas.id, action: 'UPDATE', resource: 'deal', resourceId: deals[0].id, oldValues: { stage: 'QUALIFICATION' }, newValues: { stage: 'PROPOSAL' } },
      { tenantId: tenant.id, userId: superAdmin.id, action: 'CREATE', resource: 'invoice', resourceId: 'nf-2024-003', newValues: { number: 'NF-2024-003', total: 48000 } },
    ],
  });

  console.log('Seed concluído com sucesso!');
  console.log(`Tenant principal: ${tenant.name} (${tenant.slug})`);
  console.log(`Usuário admin: rafael@nexcrm.io / NexCRM@2024!`);
  console.log(`Leads criados: ${leads.length}`);
  console.log(`Deals criados: ${deals.length}`);
  console.log(`Projetos criados: ${projects.length}`);
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
