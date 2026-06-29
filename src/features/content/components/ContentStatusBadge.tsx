import { Badge } from '@/components/ui/badge'
import { CONTENT_STATUS_LABELS } from '@/config/constants'
import type { ContentStatus } from '@/types/database.types'

const VARIANT: Record<ContentStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  published: 'default',
  scheduled: 'secondary',
  draft: 'outline',
  cancelled: 'destructive',
}

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  return (
    <Badge variant={VARIANT[status]} className="text-[11px]">
      {CONTENT_STATUS_LABELS[status]}
    </Badge>
  )
}
