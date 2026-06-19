import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { leads } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const statusLabel: Record<string, { label: string; color: string }> = {
  new: { label: 'Novo', color: 'bg-muted text-muted-foreground' },
  contacted: { label: 'Contatado', color: 'bg-blue-500/10 text-blue-500' },
  qualified: { label: 'Qualificado', color: 'bg-warning/10 text-warning' },
  proposal: { label: 'Proposta', color: 'bg-purple-500/10 text-purple-500' },
  won: { label: 'Ganho', color: 'bg-success/10 text-success' },
  lost: { label: 'Perdido', color: 'bg-destructive/10 text-destructive' },
}

export function RecentActivity() {
  const recent = [...leads]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6)

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Atividade Recente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recent.map((lead) => {
          const s = statusLabel[lead.status]
          return (
            <div key={lead.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                {lead.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>
                <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
              </div>
              <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', s.color)}>{s.label}</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
