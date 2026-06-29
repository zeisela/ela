import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/data-display/EmptyState'
import { Activity } from 'lucide-react'
import { CONTENT_TYPE_LABELS, CONTENT_STATUS_LABELS } from '@/config/constants'
import { formatDistanceToNow } from '@/lib/utils'

interface Props {
  orgId: string
}

export async function RecentActivity({ orgId }: Props) {
  const supabase = await createClient()

  const { data: items } = await supabase
    .from('content')
    .select(`
      id, title, type, status, created_at,
      clients(name)
    `)
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(8)

  const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    published: 'default',
    scheduled: 'secondary',
    draft: 'outline',
    cancelled: 'destructive',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {!items || items.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Sin actividad reciente"
            description="Las publicaciones aparecerán aquí."
          />
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {(item.clients as unknown as { name: string } | null)?.name} ·{' '}
                    {CONTENT_TYPE_LABELS[item.type]} ·{' '}
                    {formatDistanceToNow(item.created_at)}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[item.status]} className="shrink-0 text-[10px]">
                  {CONTENT_STATUS_LABELS[item.status]}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
