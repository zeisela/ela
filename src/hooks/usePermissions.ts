'use client'

import { hasPermission, type Permission } from '@/config/permissions'
import type { UserRole } from '@/types/database.types'

export function usePermissions(role: UserRole | undefined) {
  const can = (permission: Permission): boolean => {
    if (!role) return false
    return hasPermission(role, permission)
  }

  return { can }
}
