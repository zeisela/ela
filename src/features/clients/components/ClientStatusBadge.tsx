import { Badge } from '@/components/ui/badge'
import { CLIENT_STATUS_LABELS } from '@/config/constants'
import type { ClientStatus } from '@/types/database.types'

const VARIANT: Record<ClientStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  active: 'default',
  paused: 'secondary',
  inactive: 'outline',
  churned: 'destructive',
}

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge variant={VARIANT[status]} className="text-[11px]">
      {CLIENT_STATUS_LABELS[status]}
    </Badge>
  )
}
