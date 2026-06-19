import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface KpiCardProps {
  label: string
  value: string
  change?: number
  changeLabel?: string
  icon: LucideIcon
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function KpiCard({ label, value, change, changeLabel, icon: Icon, iconColor, trend }: KpiCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor =
    trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'

  return (
    <Card className="p-5 flex flex-col gap-4 hover:shadow-md transition-shadow border-border/60">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <div className={cn('p-2 rounded-lg bg-muted', iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
        {change !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
            <TrendIcon className="w-3 h-3" />
            <span>
              {change > 0 ? '+' : ''}{change}% {changeLabel ?? 'vs mês anterior'}
            </span>
          </div>
        )}
      </div>
    </Card>
  )
}
