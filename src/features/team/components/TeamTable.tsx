'use client'

import { motion } from 'framer-motion'
import { UserCircle2 } from 'lucide-react'
import { RoleBadge } from './RoleBadge'
import { MemberActions } from './MemberActions'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/database.types'

interface TeamTableProps {
  members: Profile[]
  currentUserId: string
  isAdmin: boolean
}

export function TeamTable({ members, currentUserId, isAdmin }: TeamTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Miembro</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Rol</th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
            {isAdmin && <th className="px-4 py-3 w-10" />}
          </tr>
        </thead>
        <tbody className="divide-y">
          {members.map((member, i) => (
            <motion.tr
              key={member.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-card hover:bg-accent/30 transition-colors"
            >
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    {member.avatar_url
                      ? <img src={member.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                      : <UserCircle2 className="h-5 w-5" />
                    }
                  </div>
                  <div>
                    <p className="font-medium">
                      {member.full_name}
                      {member.id === currentUserId && (
                        <span className="ml-1.5 text-xs text-muted-foreground">(tú)</span>
                      )}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <RoleBadge role={member.role} />
              </td>
              <td className="px-4 py-3">
                <span className={cn(
                  'inline-flex items-center gap-1.5 text-xs',
                  member.is_active ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'
                )}>
                  <span className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    member.is_active ? 'bg-green-500' : 'bg-muted-foreground'
                  )} />
                  {member.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              {isAdmin && (
                <td className="px-4 py-3 text-right">
                  <MemberActions member={member} currentUserId={currentUserId} isAdmin={isAdmin} />
                </td>
              )}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
