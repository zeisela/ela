'use client'

import { useState } from 'react'
import { MoreHorizontal, Shield, UserX, UserCheck, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { ROLE_LABELS } from '@/config/constants'
import { updateMemberRole, toggleMemberActive, removeMember } from '../actions/team.actions'
import type { Profile } from '@/types/database.types'
import { toast } from 'sonner'

const ROLES = ['admin', 'manager', 'editor', 'community_manager', 'designer'] as const

interface MemberActionsProps {
  member: Profile
  currentUserId: string
  isAdmin: boolean
}

export function MemberActions({ member, currentUserId, isAdmin }: MemberActionsProps) {
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState(member.role)
  const [loading, setLoading] = useState(false)
  const isSelf = member.id === currentUserId

  if (!isAdmin || isSelf) return null

  async function handleRoleUpdate() {
    setLoading(true)
    const result = await updateMemberRole({ user_id: member.id, role: selectedRole })
    setLoading(false)
    if ('error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Rol actualizado')
      setRoleDialogOpen(false)
    }
  }

  async function handleToggleActive() {
    const result = await toggleMemberActive(member.id, !member.is_active)
    if ('error' in result) toast.error(result.error)
    else toast.success(member.is_active ? 'Usuario desactivado' : 'Usuario activado')
  }

  async function handleRemove() {
    const result = await removeMember(member.id)
    if ('error' in result) toast.error(result.error)
    else toast.success('Usuario eliminado')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent transition-colors">
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setRoleDialogOpen(true)}>
            <Shield className="mr-2 h-4 w-4" />
            Cambiar rol
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleActive}>
            {member.is_active
              ? <><UserX className="mr-2 h-4 w-4" />Desactivar</>
              : <><UserCheck className="mr-2 h-4 w-4" />Activar</>
            }
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onSelect={(e) => { e.preventDefault(); setDeleteConfirmOpen(true) }}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>Cambiar rol</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Rol de {member.full_name}</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as typeof selectedRole)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setRoleDialogOpen(false)}>
                Cancelar
              </Button>
              <Button className="flex-1" onClick={handleRoleUpdate} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Eliminar usuario"
        description={`¿Eliminar a ${member.full_name} del equipo? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="destructive"
        onConfirm={handleRemove}
      />
    </>
  )
}
