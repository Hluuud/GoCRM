import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { teamPerformance } from '@/lib/mock-data'

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 0 }).format(v)

export function TeamPerformance() {
  const max = Math.max(...teamPerformance.map((t) => t.revenue))

  return (
    <Card className="col-span-2 border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Performance da Equipe</CardTitle>
        <CardDescription className="text-xs">Receita gerada por membro — mai/2025</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {teamPerformance.map((member) => (
          <div key={member.name} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                  {member.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </div>
                <span className="font-medium text-foreground text-xs">{member.name}</span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{member.leads} leads</span>
                <span>{member.deals} deals</span>
                <span className="font-semibold text-foreground">{formatCurrency(member.revenue)}</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${(member.revenue / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
