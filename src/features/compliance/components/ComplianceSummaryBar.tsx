import { cn } from '@/lib/utils'
import type { ClientCompliance } from '../repositories/compliance.repository'

interface ComplianceSummaryBarProps {
  data: ClientCompliance[]
}

export function ComplianceSummaryBar({ data }: ComplianceSummaryBarProps) {
  const withPlans = data.filter((d) => d.planId !== null)
  if (withPlans.length === 0) return null

  const avgPct = Math.round(withPlans.reduce((s, d) => s + d.overallPct, 0) / withPlans.length)
  const atOrAbove = withPlans.filter((d) => d.overallPct >= 100).length
  const below75 = withPlans.filter((d) => d.overallPct < 75).length

  const stats = [
    { label: 'Promedio general', value: `${avgPct}%`, highlight: true },
    { label: 'Clientes al 100%', value: String(atOrAbove) },
    { label: 'Por debajo del 75%', value: String(below75) },
    { label: 'Con plan activo', value: String(withPlans.length) },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border bg-card p-4">
          <p className="text-xs text-muted-foreground">{s.label}</p>
          <p className={cn('mt-1 text-2xl font-bold', s.highlight && 'text-primary')}>
            {s.value}
          </p>
        </div>
      ))}
    </div>
  )
}
