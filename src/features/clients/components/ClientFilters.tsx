'use client'

import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CLIENT_STATUS_LABELS } from '@/config/constants'
import type { ClientStatus } from '@/types/database.types'
import { cn } from '@/lib/utils'

interface ClientFiltersProps {
  search: string
  status: ClientStatus | 'all'
  onSearchChange: (v: string) => void
  onStatusChange: (v: ClientStatus | 'all') => void
}

const STATUSES = [
  { value: 'all', label: 'Todos' },
  ...Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
] as const

export function ClientFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: ClientFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar clientes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-8 pl-8 text-sm"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex gap-1">
        {STATUSES.map((s) => (
          <Button
            key={s.value}
            variant="ghost"
            size="sm"
            onClick={() => onStatusChange(s.value as ClientStatus | 'all')}
            className={cn(
              'h-8 text-xs',
              status === s.value && 'bg-accent font-medium text-accent-foreground'
            )}
          >
            {s.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
