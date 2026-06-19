'use client'

import { useState } from 'react'
import { leads } from '@/lib/mock-data'
import type { Lead, LeadStatus } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { Search, Plus, Filter, MoreHorizontal, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

const statusConfig: Record<LeadStatus, { label: string; color: string }> = {
  new: { label: 'Novo', color: 'bg-muted text-muted-foreground' },
  contacted: { label: 'Contatado', color: 'bg-blue-500/10 text-blue-500' },
  qualified: { label: 'Qualificado', color: 'bg-warning/10 text-warning-foreground' },
  proposal: { label: 'Proposta', color: 'bg-purple-500/10 text-purple-400' },
  won: { label: 'Ganho', color: 'bg-success/10 text-success' },
  lost: { label: 'Perdido', color: 'bg-destructive/10 text-destructive' },
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 0 }).format(v)

export default function LeadsPage() {
  const [query, setQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all')

  const filtered = leads.filter((l) => {
    const matchQuery =
      l.name.toLowerCase().includes(query.toLowerCase()) ||
      l.company.toLowerCase().includes(query.toLowerCase()) ||
      l.email.toLowerCase().includes(query.toLowerCase())
    const matchStatus = filterStatus === 'all' || l.status === filterStatus
    return matchQuery && matchStatus
  })

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar leads..."
            className="pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-3.5 h-3.5" />
                {filterStatus === 'all' ? 'Todos' : statusConfig[filterStatus].label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterStatus('all')}>Todos</DropdownMenuItem>
              {(Object.keys(statusConfig) as LeadStatus[]).map((s) => (
                <DropdownMenuItem key={s} onClick={() => setFilterStatus(s)}>
                  {statusConfig[s].label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" className="gap-2" onClick={() => toast.info('Formulário de novo lead')}>
            <Plus className="w-3.5 h-3.5" /> Novo Lead
          </Button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {(Object.entries(statusConfig) as [LeadStatus, { label: string; color: string }][]).map(([status, cfg]) => {
          const count = leads.filter((l) => l.status === status).length
          return (
            <Card key={status} className="p-3 text-center cursor-pointer hover:bg-muted/50 transition-colors border-border/60" onClick={() => setFilterStatus(status === filterStatus ? 'all' : status)}>
              <p className="text-lg font-bold text-foreground">{count}</p>
              <p className={cn('text-[10px] font-semibold px-1 py-0.5 rounded-full inline-block', cfg.color)}>{cfg.label}</p>
            </Card>
          )
        })}
      </div>

      {/* Table */}
      <Card className="border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Empresa</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs hidden md:table-cell">E-mail</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs">Valor</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs hidden lg:table-cell">Responsável</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((lead) => {
                const s = statusConfig[lead.status]
                return (
                  <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                          {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <span className="font-medium text-foreground">{lead.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{lead.company}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{lead.email}</td>
                    <td className="px-4 py-3">
                      <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', s.color)}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{formatCurrency(lead.value)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs">{lead.owner}</td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="w-7 h-7">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Editar lead</DropdownMenuItem>
                          <DropdownMenuItem>Converter para cliente</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive">Remover</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <TrendingUp className="w-8 h-8 mb-2 opacity-30" />
              <p className="text-sm">Nenhum lead encontrado</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
