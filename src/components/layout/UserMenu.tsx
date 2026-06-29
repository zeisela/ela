'use client'

import { LogOut, Settings, User } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROLE_LABELS } from '@/config/constants'
import { logout } from '@/features/auth/actions/auth.actions'
import type { Profile } from '@/types/database.types'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'

interface UserMenuProps {
  profile: Profile
  collapsed: boolean
}

export function UserMenu({ profile, collapsed }: UserMenuProps) {
  const router = useRouter()

  const initials = profile.full_name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-sidebar-accent"
        aria-label="Menú de usuario"
      >
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15 }}
              className="min-w-0 overflow-hidden"
            >
              <p className="truncate text-xs font-medium">{profile.full_name}</p>
              <p className="truncate text-[10px] text-muted-foreground">
                {ROLE_LABELS[profile.role]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" side="right" className="w-48">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {profile.full_name}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/settings/profile')}>
          <User className="mr-2 h-4 w-4" />
          Mi perfil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Configuración
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
