import type { UserRole } from '@/types/database.types'

type Permission =
  | 'clients:view'
  | 'clients:create'
  | 'clients:edit'
  | 'clients:delete'
  | 'plans:view'
  | 'plans:create'
  | 'plans:edit'
  | 'content:view'
  | 'content:create'
  | 'content:edit'
  | 'content:delete'
  | 'calendar:view'
  | 'compliance:view'
  | 'team:view'
  | 'team:manage'
  | 'reports:view'
  | 'reports:create'
  | 'files:view'
  | 'files:upload'
  | 'files:delete'
  | 'settings:view'
  | 'settings:edit'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'clients:view', 'clients:create', 'clients:edit', 'clients:delete',
    'plans:view', 'plans:create', 'plans:edit',
    'content:view', 'content:create', 'content:edit', 'content:delete',
    'calendar:view', 'compliance:view',
    'team:view', 'team:manage',
    'reports:view', 'reports:create',
    'files:view', 'files:upload', 'files:delete',
    'settings:view', 'settings:edit',
  ],
  manager: [
    'clients:view', 'clients:create', 'clients:edit',
    'plans:view', 'plans:create', 'plans:edit',
    'content:view', 'content:create', 'content:edit', 'content:delete',
    'calendar:view', 'compliance:view',
    'team:view',
    'reports:view', 'reports:create',
    'files:view', 'files:upload', 'files:delete',
  ],
  editor: [
    'clients:view',
    'plans:view',
    'content:view', 'content:create', 'content:edit',
    'calendar:view', 'compliance:view',
    'reports:view',
    'files:view', 'files:upload',
  ],
  community_manager: [
    'clients:view',
    'plans:view',
    'content:view', 'content:create', 'content:edit',
    'calendar:view', 'compliance:view',
    'files:view', 'files:upload',
  ],
  designer: [
    'clients:view',
    'content:view',
    'calendar:view',
    'files:view', 'files:upload',
  ],
}

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

export type { Permission }
