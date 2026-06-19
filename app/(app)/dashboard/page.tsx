import { Topbar } from '@/components/layout/topbar'
import { KpiCard } from '@/components/dashboard/kpi-card'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { LeadsFunnel } from '@/components/dashboard/leads-funnel'
import { TicketsChart } from '@/components/dashboard/tickets-chart'
import { RecentActivity } from '@/components/dashboard/recent-activity'
import { TeamPerformance } from '@/components/dashboard/team-performance'
import { AiInsightsPanel } from '@/components/dashboard/ai-insights-panel'
import {
  DollarSign,
  Users,
  MessageSquare,
  TrendingUp,
  Briefcase,
  CheckCircle2,
} from 'lucide-react'

export const metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Dashboard" description="Visão geral do seu CRM — mai/2025" />
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPIs */}
        <section aria-label="Indicadores chave" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiCard label="Receita (mai)" value="R$ 65K" change={14.2} trend="up" icon={DollarSign} iconColor="text-success" />
          <KpiCard label="Leads ativos" value="84" change={8.5} trend="up" icon={Users} iconColor="text-primary" />
          <KpiCard label="Conversão" value="18.3%" change={-2.1} trend="down" icon={TrendingUp} iconColor="text-warning" />
          <KpiCard label="Conversas" value="47" change={5.0} trend="up" icon={MessageSquare} iconColor="text-primary" />
          <KpiCard label="Projetos ativos" value="4" change={0} trend="neutral" icon={Briefcase} iconColor="text-muted-foreground" />
          <KpiCard label="Tarefas concluídas" value="31" change={22.0} trend="up" icon={CheckCircle2} iconColor="text-success" />
        </section>

        {/* Charts Row 1 */}
        <section aria-label="Gráficos de desempenho" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RevenueChart />
          <LeadsFunnel />
        </section>

        {/* Charts Row 2 */}
        <section aria-label="Tickets e atividade" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TicketsChart />
          <RecentActivity />
        </section>

        {/* Charts Row 3 */}
        <section aria-label="Equipe e IA" className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TeamPerformance />
          <AiInsightsPanel />
        </section>
      </main>
    </div>
  )
}
