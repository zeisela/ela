'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ContentTypeBadge } from '@/features/content/components/ContentTypeBadge'
import { ContentStatusBadge } from '@/features/content/components/ContentStatusBadge'
import { EmptyState } from '@/components/data-display/EmptyState'
import { CalendarDays } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { CalendarEvent } from '../hooks/useCalendar'
import type { ContentType, ContentStatus } from '@/types/database.types'

interface CalendarListViewProps {
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

export function CalendarListView({ events, onEventClick }: CalendarListViewProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const event of events) {
      const key = event.scheduled_at?.split('T')[0] ?? 'sin-fecha'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(event)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [events])

  if (grouped.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Sin contenido este mes"
        description="No hay publicaciones programadas para este período."
      />
    )
  }

  return (
    <div className="space-y-4">
      {grouped.map(([dateStr, dayEvents]) => (
        <div key={dateStr}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {dateStr !== 'sin-fecha' ? formatDate(dateStr) : 'Sin fecha'}
          </p>
          <div className="space-y-2">
            {dayEvents.map((event, i) => (
              <motion.button
                key={event.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => onEventClick(event)}
                className="flex w-full items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <ContentTypeBadge type={event.type as ContentType} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{event.title}</p>
                    {event.client && (
                      <p className="text-xs text-muted-foreground">{event.client.name}</p>
                    )}
                  </div>
                </div>
                <ContentStatusBadge status={event.status as ContentStatus} />
              </motion.button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
