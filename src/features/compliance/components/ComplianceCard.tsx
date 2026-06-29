import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProgressBar } from '@/components/data-display/ProgressBar'
import { ClientAvatar } from '@/features/clients/components/ClientAvatar'
import { CONTENT_TYPE_LABELS } from '@/config/constants'
import { cn } from '@/lib/utils'
import type { ClientCompliance } from '../repositories/compliance.repository'

interface ComplianceCardProps {
  data: ClientCompliance
}

function pctColor(pct: number): string {
  if (pct >= 100) return 'text-green-600 dark:text-green-400'
  if (pct >= 75) return 'text-blue-600 dark:text-blue-400'
  if (pct >= 50) return 'text-amber-600 dark:text-amber-400'
  return 'text-red-500'
}

export function ComplianceCard({ data }: ComplianceCardProps) {
  const hasGoals = data.posts.goal + data.reels.goal + data.stories.goal + data.carousels.goal > 0

  const bars = [
    { key: 'posts', label: CONTENT_TYPE_LABELS.post, ...data.posts },
    { key: 'reels', label: CONTENT_TYPE_LABELS.reel, ...data.reels },
    { key: 'stories', label: CONTENT_TYPE_LABELS.story, ...data.stories },
    { key: 'carousels', label: CONTENT_TYPE_LABELS.carousel, ...data.carousels },
  ].filter((b) => b.goal > 0)

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/clients/${data.clientId}`}
            className="flex items-center gap-3 min-w-0 group"
          >
            <ClientAvatar name={data.clientName} logoUrl={data.clientLogoUrl} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium group-hover:underline underline-offset-2">
                {data.clientName}
              </p>
              {data.planName && (
                <p className="truncate text-xs text-muted-foreground">{data.planName}</p>
              )}
            </div>
          </Link>

          <div className="shrink-0 text-right">
            {hasGoals ? (
              <span className={cn('text-xl font-bold', pctColor(data.overallPct))}>
                {data.overallPct}%
              </span>
            ) : (
              <Badge variant="outline" className="text-[10px]">Sin plan</Badge>
            )}
          </div>
        </div>

        {/* Progress bars */}
        {bars.length > 0 ? (
          <div className="mt-4 space-y-3">
            {bars.map((bar) => (
              <ProgressBar
                key={bar.key}
                label={bar.label}
                value={bar.done}
                max={bar.goal}
                size="sm"
              />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            Sin metas definidas para este mes.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
