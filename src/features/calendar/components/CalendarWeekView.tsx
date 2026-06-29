'use client'

import { useMemo } from 'react'
import { cn } from '@/lib/utils'
import { ContentTypeBadge } from '@/features/content/components/ContentTypeBadge'
import type { CalendarEvent } from '../hooks/useCalendar'
import type { ContentType } from '@/types/database.types'

const WEEKDAYS_FULL = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

interface CalendarWeekViewProps {
  year: number
  month: number
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
}

export function CalendarWeekView({ year, month, events, onEventClick }: CalendarWeekViewProps) {
  const weeks = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1)
    const lastDay = new Date(year, month, 0)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Build weeks
    const weeksArr: { date: Date; isToday: boolean; isCurrentMonth: boolean; events: CalendarEvent[] }[][] = []
    let currentWeek: typeof weeksArr[0] = []

    const startDow = firstDay.getDay()
    for (let i = startDow - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, -i)
      currentWeek.push({ date, isToday: false, isCurrentMonth: false, events: [] })
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(year, month - 1, d)
      const dayStr = date.toISOString().split('T')[0]
      const dayEvents = events.filter((e) => e.scheduled_at?.startsWith(dayStr))
      currentWeek.push({
        date,
        isToday: date.getTime() === today.getTime(),
        isCurrentMonth: true,
        events: dayEvents,
      })
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek)
        currentWeek = []
      }
    }
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const date = new Date(year, month, currentWeek.length - (6 - (7 - currentWeek.length)))
        currentWeek.push({ date, isToday: false, isCurrentMonth: false, events: [] })
      }
      weeksArr.push(currentWeek)
    }
    return weeksArr
  }, [year, month, events])

  return (
    <div className="space-y-3">
      {weeks.map((week, wi) => (
        <div key={wi} className="rounded-lg border overflow-hidden">
          <div className="grid grid-cols-7 divide-x">
            {week.map((day, di) => (
              <div
                key={di}
                className={cn(
                  'p-3',
                  !day.isCurrentMonth && 'bg-muted/20',
                  day.isToday && 'bg-blue-50 dark:bg-blue-950/20'
                )}
              >
                <div className="mb-2 flex flex-col items-center gap-0.5">
                  <span className="text-[10px] text-muted-foreground">
                    {WEEKDAYS_FULL[day.date.getDay()].slice(0, 3)}
                  </span>
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
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

                <div className="space-y-1">
                  {day.events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onEventClick(event)}
                      className="w-full rounded p-1 text-left transition-colors hover:bg-accent"
                    >
                      <ContentTypeBadge type={event.type as ContentType} />
                      <p className="mt-0.5 truncate text-[11px]">{event.title}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
