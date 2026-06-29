'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { planSchema, type PlanInput } from '../schemas/plan.schema'
import { createPlanAction, updatePlanAction } from '../actions/plan.actions'
import { MONTHS } from '@/config/constants'

interface PlanFormProps {
  clientId: string
  planId?: string
  defaultValues?: Partial<PlanInput>
  mode?: 'create' | 'edit'
  onSuccess?: () => void
  onCancel?: () => void
}

const currentYear = new Date().getFullYear()
const YEARS = [currentYear - 1, currentYear, currentYear + 1]

export function PlanForm({
  clientId,
  planId,
  defaultValues,
  mode = 'create',
  onSuccess,
  onCancel,
}: PlanFormProps) {
  const [loading, setLoading] = useState(false)

  const form = useForm<PlanInput>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      month: new Date().getMonth() + 1,
      year: currentYear,
      posts_goal: 0,
      reels_goal: 0,
      stories_goal: 0,
      carousels_goal: 0,
      is_active: true,
      ...defaultValues,
    },
  })

  async function onSubmit(data: PlanInput) {
    setLoading(true)
    const result =
      mode === 'edit' && planId
        ? await updatePlanAction(clientId, planId, data)
        : await createPlanAction(clientId, data)
    setLoading(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    toast.success(mode === 'edit' ? 'Plan actualizado' : 'Plan creado')
    onSuccess?.()
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      {/* Nombre + periodo */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5 sm:col-span-3">
          <Label htmlFor="name">Nombre del plan *</Label>
          <Input id="name" placeholder="Plan Mensual Básico" {...form.register('name')} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Mes</Label>
          <Select
            defaultValue={String(form.getValues('month'))}
            onValueChange={(v) => form.setValue('month', Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((label, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label>Año</Label>
          <Select
            defaultValue={String(form.getValues('year'))}
            onValueChange={(v) => form.setValue('year', Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metas */}
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Metas mensuales
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { key: 'posts_goal', label: 'Posts' },
            { key: 'reels_goal', label: 'Reels' },
            { key: 'stories_goal', label: 'Historias' },
            { key: 'carousels_goal', label: 'Carruseles' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1.5">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                type="number"
                min={0}
                placeholder="0"
                {...form.register(key as keyof PlanInput, { valueAsNumber: true })}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'edit' ? 'Guardar cambios' : 'Crear plan'}
        </Button>
      </div>
    </form>
  )
}
