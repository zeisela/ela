'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Check, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateContentStatusAction } from '../actions/content.actions'
import type { ContentStatus } from '@/types/database.types'

interface ContentStatusActionsProps {
  contentId: string
  currentStatus: ContentStatus
}

export function ContentStatusActions({ contentId, currentStatus }: ContentStatusActionsProps) {
  const [isPending, startTransition] = useTransition()

  function updateStatus(status: ContentStatus) {
    startTransition(async () => {
      const result = await updateContentStatusAction(contentId, status)
      if ('error' in result) toast.error(result.error)
      else toast.success('Estado actualizado')
    })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {currentStatus !== 'scheduled' && currentStatus !== 'published' && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => updateStatus('scheduled')}
        >
          <Clock className="mr-1.5 h-3.5 w-3.5" />
          Marcar como programado
        </Button>
      )}
      {currentStatus !== 'published' && (
        <Button
          size="sm"
          disabled={isPending}
          onClick={() => updateStatus('published')}
        >
          <Check className="mr-1.5 h-3.5 w-3.5" />
          Marcar como publicado
        </Button>
      )}
      {currentStatus !== 'cancelled' && currentStatus !== 'published' && (
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => updateStatus('cancelled')}
        >
          <X className="mr-1.5 h-3.5 w-3.5" />
          Cancelar
        </Button>
      )}
    </div>
  )
}
