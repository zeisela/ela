'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { FILE_CATEGORY_LABELS } from '@/config/constants'
import { cn } from '@/lib/utils'
import type { FileCategory } from '@/types/database.types'

const CATEGORIES: (FileCategory | 'all')[] = ['all', 'brandbook', 'logo', 'video', 'photo', 'manual', 'other']
const LABELS: Record<string, string> = { all: 'Todos', ...FILE_CATEGORY_LABELS }

export function FileCategoryTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const current = params.get('category') ?? 'all'

  function navigate(cat: string) {
    const p = new URLSearchParams(params.toString())
    if (cat === 'all') p.delete('category')
    else p.set('category', cat)
    router.push(`${pathname}?${p.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => navigate(cat)}
          className={cn(
            'rounded-full px-3 py-1 text-xs font-medium transition-colors',
            current === cat
              ? 'bg-foreground text-background'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          {LABELS[cat]}
        </button>
      ))}
    </div>
  )
}
