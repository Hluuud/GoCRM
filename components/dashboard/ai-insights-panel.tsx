import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Lightbulb, AlertTriangle, TrendingUp, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

const insights = [
  {
    type: 'opportunity',
    icon: TrendingUp,
    color: 'text-success',
    bg: 'bg-success/10',
    title: 'TechCorp pronta para fechar',
    desc: 'Proposta enviada há 3 dias com alta probabilidade (75%). Sugerimos follow-up hoje.',
  },
  {
    type: 'alert',
    icon: AlertTriangle,
    color: 'text-warning',
    bg: 'bg-warning/10',
    title: 'Fatura vencida — Logística Rápida',
    desc: 'NF-2025-004 venceu em 30/04. Contato recomendado para evitar inadimplência.',
  },
  {
    type: 'insight',
    icon: Lightbulb,
    color: 'text-primary',
    bg: 'bg-primary/10',
    title: 'Queda de conversão detectada',
    desc: 'Taxa de conversão caiu 2.1% esta semana. Leads na etapa "Contatado" sem avanço.',
  },
]

export function AiInsightsPanel() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-primary" />
            <CardTitle className="text-sm font-semibold">Insights IA</CardTitle>
          </div>
          <Badge variant="secondary" className="text-[10px]">3 novos</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className="flex gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
            <div className={`w-7 h-7 rounded-lg ${insight.bg} flex items-center justify-center flex-shrink-0`}>
              <insight.icon className={`w-3.5 h-3.5 ${insight.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground">{insight.title}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{insight.desc}</p>
            </div>
          </div>
        ))}
        <Link
          href="/ai"
          className="flex items-center justify-center gap-1 text-xs text-primary font-medium hover:underline mt-1"
        >
          Ver todos os insights
          <ArrowRight className="w-3 h-3" />
        </Link>
      </CardContent>
    </Card>
  )
}
