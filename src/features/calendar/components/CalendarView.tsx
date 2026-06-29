'use client'

import { useState } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CalendarMonthView } from './CalendarMonthView'
import { CalendarWeekView } from './CalendarWeekView'
import { CalendarListView } from './CalendarListView'
import { CalendarEventDetail } from './CalendarEventDetail'
import { CalendarLegend } from './CalendarLegend'
import { useCalendarEvents, type CalendarEvent } from '../hooks/useCalendar'
import { MONTHS } from '@/config/constants'
import { cn } from '@/lib/utils'

type ViewMode = 'month' | 'week' | 'list'

const VIEW_LABELS: Record<ViewMode, string> = {
  month: 'Mes',
  week: 'Semana',
  list: 'Lista',
}

export function CalendarView() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const now = new Date()
  const month = Number(params.get('month') ?? now.getMonth() + 1)
  const year = Number(params.get('year') ?? now.getFullYear())

  const [view, setView] = useState<ViewMode>('month')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const { data: events = [], isLoading } = useCalendarEvents(year, month)

  function navigate(delta: number) {
    let m = month + delta
    let y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    router.push(`${pathname}?month=${m}&year=${y}`)
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-40 text-center text-sm font-semibold">
            {MONTHS[month - 1]} {year}
          </span>
          <Button variant="ghost" size="icon-sm" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`${pathname}?month=${now.getMonth() + 1}&year=${now.getFullYear()}`)}
          >
            Hoy
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* View switcher */}
          <div className="flex rounded-lg border p-0.5">
            {(['month', 'week', 'list'] as ViewMode[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  view === v
                    ? 'bg-background shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>

          <Button size="sm" onClick={() => router.push('/content/new')}>
            <Plus className="mr-1.5 h-4 w-4" />
            Contenido
          </Button>
        </div>
      </div>

      {/* Legend */}
      <CalendarLegend />

      {/* Calendar body */}
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      ) : view === 'month' ? (
        <CalendarMonthView
          year={year}
          month={month}
          events={events}
          onEventClick={setSelectedEvent}
        />
      ) : view === 'week' ? (
        <CalendarWeekView
          year={year}
          month={month}
          events={events}
          onEventClick={setSelectedEvent}
        />
      ) : (
        <CalendarListView events={events} onEventClick={setSelectedEvent} />
      )}

      {/* Event detail dialog */}
      <CalendarEventDetail event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  )
}
