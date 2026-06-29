import { cn } from '@/lib/utils'
import { CONTENT_TYPE_LABELS } from '@/config/constants'
import type { ContentType } from '@/types/database.types'

const COLORS: Record<ContentType, string> = {
  post: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  reel: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
  carousel: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  story: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
}

const DOT: Record<ContentType, string> = {
  post: 'bg-blue-500',
  reel: 'bg-purple-500',
  carousel: 'bg-amber-500',
  story: 'bg-green-500',
}

export function ContentTypeBadge({ type }: { type: ContentType }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium', COLORS[type])}>
      <span className={cn('h-1.5 w-1.5 rounded-full', DOT[type])} />
      {CONTENT_TYPE_LABELS[type]}
    </span>
  )
}

export function ContentTypeDot({ type }: { type: ContentType }) {
  return <span className={cn('h-2 w-2 rounded-full shrink-0', DOT[type])} />
}
