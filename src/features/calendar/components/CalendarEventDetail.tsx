'use client'

import { useRouter } from 'next/navigation'
import { Pencil, ExternalLink } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ContentTypeBadge } from '@/features/content/components/ContentTypeBadge'
import { ContentStatusBadge } from '@/features/content/components/ContentStatusBadge'
import { formatDate } from '@/lib/utils'
import type { CalendarEvent } from '../hooks/useCalendar'
import type { ContentType, ContentStatus } from '@/types/database.types'

interface CalendarEventDetailProps {
  event: CalendarEvent | null
  onClose: () => void
}

export function CalendarEventDetail({ event, onClose }: CalendarEventDetailProps) {
  const router = useRouter()

  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        {event && (
          <>
            <DialogHeader>
              <DialogTitle className="text-base">{event.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <ContentTypeBadge type={event.type as ContentType} />
                <ContentStatusBadge status={event.status as ContentStatus} />
              </div>

              <div className="space-y-1.5 text-sm">
                {event.client && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cliente</span>
                    <span className="font-medium">{event.client.name}</span>
                  </div>
                )}
                {event.scheduled_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha</span>
                    <span className="font-medium">{formatDate(event.scheduled_at)}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    router.push(`/content/${event.id}`)
                    onClose()
                  }}
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Ver detalle
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    router.push(`/content/${event.id}/edit`)
                    onClose()
                  }}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Editar
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
