'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2, AtSign, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { clientSchema, type ClientInput } from '../schemas/client.schema'
import { createClientAction, updateClientAction } from '../actions/client.actions'
import { CLIENT_STATUS_LABELS } from '@/config/constants'

interface ClientFormProps {
  defaultValues?: Partial<ClientInput> & { id?: string }
  teamMembers?: { id: string; full_name: string }[]
  mode?: 'create' | 'edit'
}

export function ClientForm({ defaultValues, teamMembers = [], mode = 'create' }: ClientFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      company: '',
      instagram: '',
      facebook: '',
      tiktok: '',
      status: 'active',
      assigned_to: null,
      start_date: null,
      notes: '',
      ...defaultValues,
    },
  })

  async function onSubmit(data: ClientInput) {
    setLoading(true)
    const result =
      mode === 'edit' && defaultValues?.id
        ? await updateClientAction(defaultValues.id, data)
        : await createClientAction(data)
    setLoading(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    toast.success(mode === 'edit' ? 'Cliente actualizado' : 'Cliente creado')
    router.push(mode === 'edit' && defaultValues?.id ? `/clients/${defaultValues.id}` : '/clients')
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Información principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Información general</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre del cliente *</Label>
            <Input id="name" placeholder="Nombre" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company">Empresa</Label>
            <Input id="company" placeholder="Empresa S.A." {...form.register('company')} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">Estado</Label>
            <Select
              defaultValue={form.getValues('status')}
              onValueChange={(v) => form.setValue('status', v as ClientInput['status'])}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CLIENT_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="start_date">Fecha de inicio</Label>
            <Input id="start_date" type="date" {...form.register('start_date')} />
          </div>

          {teamMembers.length > 0 && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="assigned_to">Responsable</Label>
              <Select
                defaultValue={form.getValues('assigned_to') ?? ''}
                onValueChange={(v) => form.setValue('assigned_to', v || null)}
              >
                <SelectTrigger id="assigned_to">
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redes sociales */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Redes sociales</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="instagram">Instagram</Label>
            <div className="relative">
              <AtSign className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="instagram"
                className="pl-8"
                placeholder="@usuario"
                {...form.register('instagram')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="facebook">Facebook</Label>
            <div className="relative">
              <Globe className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="facebook"
                className="pl-8"
                placeholder="pagina"
                {...form.register('facebook')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tiktok">TikTok</Label>
            <Input id="tiktok" placeholder="@usuario" {...form.register('tiktok')} />
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Notas internas</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Observaciones, contexto del cliente..."
            rows={4}
            {...form.register('notes')}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'edit' ? 'Guardar cambios' : 'Crear cliente'}
        </Button>
      </div>
    </form>
  )
}
