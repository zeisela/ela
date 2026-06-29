import type { UserRole } from '@/types/database.types'

export type NavItem = {
  label: string
  href: string
  icon: string
  permission?: string
  badge?: string
}

export type NavSection = {
  title?: string
  items: NavItem[]
}

export const navigation: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
      { label: 'Clientes', href: '/clients', icon: 'Users' },
      { label: 'Contenidos', href: '/content', icon: 'FileText' },
      { label: 'Calendario', href: '/calendar', icon: 'CalendarDays' },
      { label: 'Cumplimiento', href: '/compliance', icon: 'BarChart3' },
    ],
  },
  {
    title: 'Gestión',
    items: [
      { label: 'Equipo', href: '/team', icon: 'UserCog', permission: 'team:view' },
      { label: 'Reportes', href: '/reports', icon: 'FileBarChart' },
      { label: 'Archivos', href: '/files', icon: 'FolderOpen' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { label: 'Configuración', href: '/settings', icon: 'Settings', permission: 'settings:view' },
    ],
  },
]

export const ROLE_HIDDEN_NAV: Partial<Record<UserRole, string[]>> = {
  designer: ['/compliance', '/reports', '/team'],
  community_manager: ['/reports', '/team'],
}
