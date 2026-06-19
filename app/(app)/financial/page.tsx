'use client'

import { useState } from 'react'
import { invoices, revenueData } from '@/lib/mock-data'
import type { InvoiceStatus } from '@/lib/mock-data'
import { Topbar } from '@/components/layout/topbar'
import { cn } from '@/lib/utils'
import { Plus, MoreHorizontal, TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const invoiceStatusConfig: Record<InvoiceStatus, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  sent: { label: 'Enviada', color: 'bg-blue-500/10 text-blue-500' },
  paid: { label: 'Paga', color: 'bg-success/10 text-success' },
  overdue: { label: 'Vencida', color: 'bg-destructive/10 text-destructive' },
}

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((a, b) => a + b.amount, 0)
const totalPending = invoices.filter((i) => i.status === 'sent').reduce((a, b) => a + b.amount, 0)
const totalOverdue = invoices.filter((i) => i.status === 'overdue').reduce((a, b) => a + b.amount, 0)

export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'invoices' | 'transactions'>('overview')

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <Topbar title="Financeiro" description="Controle de faturas, receitas e fluxo de caixa" />

      {/* Sub-tabs */}
      <div className="flex items-center gap-1 px-6 border-b border-border bg-card/60 overflow-x-auto">
        {(['overview', 'invoices', 'transactions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-3 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors capitalize',
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab === 'overview' ? 'Visão Geral' : tab === 'invoices' ? 'Faturas' : 'Transações'}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4 border-border/60">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-success" />
                  <p className="text-xs text-muted-foreground font-medium">Receita recebida</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPaid)}</p>
                <p className="text-xs text-success mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" />+14% vs mês anterior</p>
              </Card>
              <Card className="p-4 border-border/60">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-blue-500" />
                  <p className="text-xs text-muted-foreground font-medium">A receber</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPending)}</p>
                <p className="text-xs text-muted-foreground mt-1">{invoices.filter((i) => i.status === 'sent').length} fatura(s) pendente(s)</p>
              </Card>
              <Card className="p-4 border-border/60">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <p className="text-xs text-muted-foreground font-medium">Em atraso</p>
                </div>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalOverdue)}</p>
                <p className="text-xs text-destructive mt-1 flex items-center gap-1"><TrendingDown className="w-3 h-3" />Ação necessária</p>
              </Card>
              <Card className="p-4 border-border/60">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-warning" />
                  <p className="text-xs text-muted-foreground font-medium">Total pipeline</p>
                </div>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalPaid + totalPending + totalOverdue)}</p>
                <p className="text-xs text-muted-foreground mt-1">{invoices.length} faturas</p>
              </Card>
            </div>

            {/* Revenue Chart */}
            <Card className="border-border/60 p-5">
              <h3 className="text-sm font-semibold mb-1">Receita Anual 2025</h3>
              <p className="text-xs text-muted-foreground mb-4">Receita realizada vs meta mensal</p>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenueData} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                  <defs>
                    <linearGradient id="finGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v)}
                    contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="receita" name="Receita" stroke="var(--color-chart-1)" strokeWidth={2} fill="url(#finGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Faturas</h2>
              <Button size="sm" className="gap-2" onClick={() => toast.info('Nova fatura')}>
                <Plus className="w-3.5 h-3.5" /> Nova Fatura
              </Button>
            </div>
            <Card className="border-border/60 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Número</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Cliente</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs hidden md:table-cell">Emissão</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Vencimento</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground text-xs">Valor</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs">Status</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const s = invoiceStatusConfig[inv.status]
                    return (
                      <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inv.number}</td>
                        <td className="px-4 py-3 font-medium text-foreground">{inv.client}</td>
                        <td className="px-4 py-3 text-muted-foreground hidden md:table-cell text-xs">{new Date(inv.issuedAt).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3 text-xs">{new Date(inv.dueDate).toLocaleDateString('pt-BR')}</td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">{formatCurrency(inv.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={cn('text-[11px] font-semibold px-2 py-0.5 rounded-full', s.color)}>{s.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="w-7 h-7">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Visualizar</DropdownMenuItem>
                              <DropdownMenuItem>Enviar por e-mail</DropdownMenuItem>
                              <DropdownMenuItem>Marcar como paga</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive focus:text-destructive">Cancelar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Card>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <DollarSign className="w-10 h-10 mb-2 opacity-20" />
            <p className="text-sm">Módulo de transações em desenvolvimento</p>
          </div>
        )}
      </main>
    </div>
  )
}
