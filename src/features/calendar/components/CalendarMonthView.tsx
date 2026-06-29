'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ContentTypeDot } from '@/features/content/components/ContentTypeBadge'
import type { CalendarEvent } from '../hooks/useCalendar'
import type { ContentType } from '@/types/database.types'

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface CalendarMonthViewProps {
  year: number
  month: number
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: CalendarEvent[]
}

export function CalendarMonthView({ year, month, events, onEventClick }: CalendarMonthViewProps) {
  const days = useMemo<CalendarDay[]>(() => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const startDow = firstDay.getDay() // 0=Sun

    const cells: CalendarDay[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Leading days from previous month
    for (let i = startDow - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, -i)
      cells.push({ date, isCurrentMonth: false, isToday: false, events: [] })
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month - 1, d)
      const dayStr = date.toISOString().split('T')[0]
      const dayEvents = events.filter((e) => e.scheduled_at?.startsWith(dayStr))
      cells.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        events: dayEvents,
      })
    }

    // Trailing days to fill last row
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month, d)
      cells.push({ date, isCurrentMonth: false, isToday: false, events: [] })
    }

    return cells
  }, [year, month, events])

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Header row */}
      <div className="grid grid-cols-7 border-b bg-muted/30">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2 text-center text-xs font-medium text-muted-foreground">
            {w}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => (
          <div
            key={i}
            className={cn(
              'min-h-24 border-b border-r p-1.5 last:border-r-0',
              !day.isCurrentMonth && 'bg-muted/20',
              day.isToday && 'bg-blue-50 dark:bg-blue-950/20',
              'last-row:border-b-0'
            )}
          >
            {/* Day number */}
            <div className="mb-1 flex items-center justify-end">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                  day.isToday
                    ? 'bg-primary text-primary-foreground'
                    : day.isCurrentMonth
                      ? 'text-foreground'
                      : 'text-muted-foreground/40'
                )}
              >
                {day.date.getDate()}
              </span>
            </div>

            {/* Events */}
            <div className="space-y-0.5">
              {day.events.slice(0, 3).map((event) => (
                <motion.button
                  key={event.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => onEventClick(event)}
                  className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[11px] transition-colors hover:bg-accent"
                >
                  <ContentTypeDot type={event.type as ContentType} />
                  <span className="truncate leading-tight">{event.title}</span>
                </motion.button>
              ))}
              {day.events.length > 3 && (
                <p className="px-1 text-[10px] text-muted-foreground">
                  +{day.events.length - 3} más
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
