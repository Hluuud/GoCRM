'use client'

import { leadsConversionData } from '@/lib/mock-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  FunnelChart,
  Funnel,
  Tooltip,
  LabelList,
  ResponsiveContainer,
} from 'recharts'

const COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
]

export function LeadsFunnel() {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Funil de Leads</CardTitle>
        <CardDescription className="text-xs">Conversão por etapa</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <FunnelChart>
            <Tooltip
              contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: 12 }}
            />
            <Funnel
              dataKey="value"
              data={leadsConversionData.map((d, i) => ({ ...d, fill: COLORS[i % COLORS.length] }))}
              isAnimationActive
            >
              <LabelList position="right" fill="var(--color-muted-foreground)" fontSize={11} dataKey="stage" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
