'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ROLE_LABELS } from '@/config/constants'
import { inviteSchema, type InviteInput } from '../schemas/team.schema'
import { inviteTeamMember } from '../actions/team.actions'
import { toast } from 'sonner'

const ROLES = ['admin', 'manager', 'editor', 'community_manager', 'designer'] as const

export function InviteDialog() {
  const [open, setOpen] = useState(false)
  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting } } =
    useForm<InviteInput>({ resolver: zodResolver(inviteSchema) })

  async function onSubmit(data: InviteInput) {
    const result = await inviteTeamMember(data)
    if ('error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Invitación enviada correctamente')
      setOpen(false)
      reset()
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="mr-1.5 h-4 w-4" />
        Invitar miembro
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Invitar al equipo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Nombre completo</Label>
              <Input {...register('full_name')} placeholder="Juan Pérez" />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input {...register('email')} type="email" placeholder="juan@empresa.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Rol</Label>
              <Select onValueChange={(v) => setValue('role', v as InviteInput['role'])}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r} value={r}>{ROLE_LABELS[r]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar invitación'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
