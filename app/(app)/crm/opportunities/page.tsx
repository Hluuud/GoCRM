'use client'

import { deals } from '@/lib/mock-data'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const stageLabel: Record<string, { label: string; color: string }> = {
  new: { label: 'Novo', color: 'bg-muted text-muted-foreground' },
  contacted: { label: 'Contatado', color: 'bg-blue-500/10 text-blue-500' },
  qualified: { label: 'Qualificado', color: 'bg-warning/10 text-warning-foreground' },
  proposal: { label: 'Proposta', color: 'bg-purple-500/10 text-purple-400' },
  won: { label: 'Ganho', color: 'bg-success/10 text-success' },
  lost: { label: 'Perdido', color: 'bg-destructive/10 text-destructive' },
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

const totalPipeline = deals.reduce((acc, d) => acc + d.value * (d.probability / 100), 0)
const totalValue = deals.reduce((acc, d) => acc + d.value, 0)

export default function OpportunitiesPage() {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-border/60">
          <p className="text-xs text-muted-foreground mb-1">Valor total pipeline</p>
          <p className="text-2xl font-bold text-foreground">{formatCurrency(totalValue)}</p>
        </Card>
        <Card className="p-4 border-border/60">
          <p className="text-xs text-muted-foreground mb-1">Receita ponderada</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalPipeline)}</p>
        </Card>
        <Card className="p-4 border-border/60">
          <p className="text-xs text-muted-foreground mb-1">Total de oportunidades</p>
          <p className="text-2xl font-bold text-foreground">{deals.length}</p>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Todas as oportunidades</h2>
        <Button size="sm" className="gap-2" onClick={() => toast.info('Nova oportunidade')}>
          <Plus className="w-3.5 h-3.5" /> Nova oportunidade
        </Button>
      </div>

      <div className="space-y-3">
        {deals.map((deal) => {
          const s = stageLabel[deal.stage]
          return (
            <Card key={deal.id} className="p-4 border-border/60 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    <p className="font-semibold text-foreground text-sm truncate">{deal.title}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{deal.contact} · {deal.company}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', s.color)}>{s.label}</span>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{formatCurrency(deal.value)}</p>
                    <p className="text-[11px] text-muted-foreground">{deal.probability}% prob.</p>
                  </div>
                  <div className="text-right hidden md:block">
                    <p className="text-xs text-muted-foreground">Fecha</p>
                    <p className="text-xs font-medium text-foreground">{new Date(deal.closeDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {deal.owner.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                </div>
              </div>
              <div className="mt-3 h-1 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${deal.probability}%` }} />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
