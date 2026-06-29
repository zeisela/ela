import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercent?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = true,
  size = 'md',
  className,
}: ProgressBarProps) {
  const pct = Math.min(Math.round((value / (max || 1)) * 100), 100)
  const color =
    pct >= 100
      ? 'bg-green-500'
      : pct >= 75
        ? 'bg-blue-500'
        : pct >= 50
          ? 'bg-amber-500'
          : 'bg-red-500'

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercent) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
          {showPercent && (
            <span className="text-xs font-medium">
              {value}/{max} ({pct}%)
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full rounded-full bg-muted', size === 'sm' ? 'h-1.5' : 'h-2')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
