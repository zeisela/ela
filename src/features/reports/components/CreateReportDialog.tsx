'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MONTHS } from '@/config/constants'
import { createReportSchema, type CreateReportInput } from '../schemas/report.schema'
import { createReport } from '../actions/report.actions'
import { toast } from 'sonner'

interface Client { id: string; name: string }
interface Plan { id: string; name: string; client_id: string }

interface CreateReportDialogProps {
  clients: Client[]
  plans: Plan[]
}

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

export function CreateReportDialog({ clients, plans }: CreateReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState('')
  const router = useRouter()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } =
    useForm<CreateReportInput>({
      resolver: zodResolver(createReportSchema),
      defaultValues: {
        period_month: new Date().getMonth() + 1,
        period_year: new Date().getFullYear(),
      },
    })

  const clientPlans = plans.filter((p) => p.client_id === selectedClient)

  async function onSubmit(data: CreateReportInput) {
    const result = await createReport(data)
    if ('error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Reporte creado')
      setOpen(false)
      reset()
      setSelectedClient('')
      router.push(`/reports/${result.id}`)
    }
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 h-4 w-4" />
        Nuevo reporte
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Crear reporte</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Título</Label>
              <Input {...register('title')} placeholder="Reporte mensual — Enero 2026" />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Select onValueChange={(v) => {
                const val = v as string ?? ''
                setSelectedClient(val)
                setValue('client_id', val)
                setValue('plan_id', null)
              }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar cliente" /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {errors.client_id && <p className="text-xs text-destructive">{errors.client_id.message}</p>}
            </div>

            {clientPlans.length > 0 && (
              <div className="space-y-1.5">
                <Label>Plan (opcional)</Label>
                <Select onValueChange={(v) => setValue('plan_id', (v as string) ?? null)}>
                  <SelectTrigger><SelectValue placeholder="Sin plan específico" /></SelectTrigger>
                  <SelectContent>
                    {clientPlans.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Mes</Label>
                <Select
                  defaultValue={String(new Date().getMonth() + 1)}
                  onValueChange={(v) => setValue('period_month', Number(v))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MONTHS.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Año</Label>
                <Select
                  defaultValue={String(new Date().getFullYear())}
                  onValueChange={(v) => setValue('period_year', Number(v))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Observaciones (opcional)</Label>
              <textarea
                {...register('observations')}
                rows={3}
                placeholder="Notas adicionales para el reporte..."
                className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Creando...' : 'Crear reporte'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
