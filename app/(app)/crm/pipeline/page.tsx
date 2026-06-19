'use client'

import { deals } from '@/lib/mock-data'
import type { LeadStatus } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Plus, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const columns: { status: LeadStatus; label: string; color: string }[] = [
  { status: 'new', label: 'Novos', color: 'border-muted-foreground/30' },
  { status: 'contacted', label: 'Contatados', color: 'border-blue-500/50' },
  { status: 'qualified', label: 'Qualificados', color: 'border-warning/60' },
  { status: 'proposal', label: 'Proposta', color: 'border-purple-500/50' },
  { status: 'won', label: 'Ganhos', color: 'border-success/60' },
]

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 0 }).format(v)

export default function PipelinePage() {
  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Kanban de Oportunidades</h2>
          <p className="text-xs text-muted-foreground">{deals.length} deals ativos</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => toast.info('Novo deal')}>
          <Plus className="w-3.5 h-3.5" /> Novo Deal
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colDeals = deals.filter((d) => d.stage === col.status)
          const total = colDeals.reduce((acc, d) => acc + d.value, 0)
          return (
            <div key={col.status} className="flex-shrink-0 w-72">
              {/* Column header */}
              <div className={cn('flex items-center justify-between mb-3 pb-2 border-b-2', col.color)}>
                <div>
                  <p className="text-sm font-semibold text-foreground">{col.label}</p>
                  <p className="text-xs text-muted-foreground">{colDeals.length} deals · {formatCurrency(total)}</p>
                </div>
                <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => toast.info('Adicionar deal')}>
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Cards */}
              <div className="space-y-3">
                {colDeals.map((deal) => (
                  <Card key={deal.id} className="p-3 cursor-pointer hover:shadow-md transition-all border-border/60 group">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm font-medium text-foreground leading-snug">{deal.title}</p>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-6 h-6 opacity-0 group-hover:opacity-100 flex-shrink-0">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                          <DropdownMenuItem>Mover etapa</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">Remover</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{deal.company}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-foreground">{formatCurrency(deal.value)}</span>
                      <Badge variant="secondary" className="text-[10px]">{deal.probability}%</Badge>
                    </div>
                    {/* Probability bar */}
                    <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${deal.probability}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-muted-foreground">Fecha: {new Date(deal.closeDate).toLocaleDateString('pt-BR')}</p>
                      <div className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[9px] font-bold flex items-center justify-center">
                        {deal.owner.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                      </div>
                    </div>
                  </Card>
                ))}
                {colDeals.length === 0 && (
                  <div className="h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                    <p className="text-xs text-muted-foreground/50">Arraste um deal aqui</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
