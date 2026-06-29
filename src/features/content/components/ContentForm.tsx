'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { contentSchema, type ContentInput } from '../schemas/content.schema'
import { createContentAction, updateContentAction } from '../actions/content.actions'
import { CONTENT_TYPE_LABELS, CONTENT_STATUS_LABELS } from '@/config/constants'

interface ContentFormProps {
  defaultValues?: Partial<ContentInput> & { id?: string }
  clients: { id: string; name: string }[]
  teamMembers?: { id: string; full_name: string }[]
  plans?: { id: string; name: string; month: number; year: number }[]
  mode?: 'create' | 'edit'
  preselectedClientId?: string
}

export function ContentForm({
  defaultValues,
  clients,
  teamMembers = [],
  plans = [],
  mode = 'create',
  preselectedClientId,
}: ContentFormProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const form = useForm<ContentInput>({
    resolver: zodResolver(contentSchema),
    defaultValues: {
      title: '',
      type: 'post',
      status: 'draft',
      client_id: preselectedClientId ?? '',
      plan_id: null,
      scheduled_at: null,
      published_at: null,
      assigned_to: null,
      notes: '',
      ...defaultValues,
    },
  })

  async function onSubmit(data: ContentInput) {
    setLoading(true)
    const result =
      mode === 'edit' && defaultValues?.id
        ? await updateContentAction(defaultValues.id, data)
        : await createContentAction(data)
    setLoading(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    toast.success(mode === 'edit' ? 'Contenido actualizado' : 'Contenido creado')
    router.push(
      mode === 'edit' && defaultValues?.id ? `/content/${defaultValues.id}` : '/content'
    )
  }

  const selectedStatus = form.watch('status')

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Información del contenido</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">Título *</Label>
            <Input id="title" placeholder="Ej: Lanzamiento nueva colección" {...form.register('title')} />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select
              defaultValue={form.getValues('type')}
              onValueChange={(v) => form.setValue('type', v as ContentInput['type'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONTENT_TYPE_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select
              defaultValue={form.getValues('status')}
              onValueChange={(v) => form.setValue('status', v as ContentInput['status'])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONTENT_STATUS_LABELS).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Cliente *</Label>
            <Select
              defaultValue={form.getValues('client_id')}
              onValueChange={(v) => {
                form.setValue('client_id', v as string)
                form.setValue('plan_id', null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cliente" />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.client_id && (
              <p className="text-xs text-destructive">{form.formState.errors.client_id.message}</p>
            )}
          </div>

          {plans.length > 0 && (
            <div className="space-y-1.5">
              <Label>Plan</Label>
              <Select
                defaultValue={form.getValues('plan_id') ?? ''}
                onValueChange={(v) => form.setValue('plan_id', v || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin plan</SelectItem>
                  {plans.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="scheduled_at">Fecha programada</Label>
            <Input
              id="scheduled_at"
              type="datetime-local"
              {...form.register('scheduled_at')}
            />
          </div>

          {selectedStatus === 'published' && (
            <div className="space-y-1.5">
              <Label htmlFor="published_at">Fecha de publicación</Label>
              <Input
                id="published_at"
                type="datetime-local"
                {...form.register('published_at')}
              />
            </div>
          )}

          {teamMembers.length > 0 && (
            <div className="space-y-1.5">
              <Label>Responsable</Label>
              <Select
                defaultValue={form.getValues('assigned_to') ?? ''}
                onValueChange={(v) => form.setValue('assigned_to', v === '' ? null : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sin asignar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin asignar</SelectItem>
                  {teamMembers.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Instrucciones, referencias, observaciones..."
            rows={4}
            {...form.register('notes')}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'edit' ? 'Guardar cambios' : 'Crear contenido'}
        </Button>
      </div>
    </form>
  )
}
