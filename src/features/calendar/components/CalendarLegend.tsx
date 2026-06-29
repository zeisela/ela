import { CONTENT_TYPE_LABELS } from '@/config/constants'

const TYPES = [
  { key: 'post', color: 'bg-blue-500' },
  { key: 'reel', color: 'bg-purple-500' },
  { key: 'carousel', color: 'bg-amber-500' },
  { key: 'story', color: 'bg-green-500' },
] as const

export function CalendarLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {TYPES.map(({ key, color }) => (
        <div key={key} className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${color}`} />
          <span className="text-xs text-muted-foreground">{CONTENT_TYPE_LABELS[key]}</span>
        </div>
      ))}
    </div>
  )
}
