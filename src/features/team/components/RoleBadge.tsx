import { ROLE_LABELS } from '@/config/constants'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/database.types'

const ROLE_STYLES: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  manager: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  editor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  community_manager: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  designer: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', ROLE_STYLES[role])}>
      {ROLE_LABELS[role]}
    </span>
  )
}
