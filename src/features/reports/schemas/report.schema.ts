import { z } from 'zod'

export const createReportSchema = z.object({
  client_id: z.string().uuid('Cliente requerido'),
  plan_id: z.string().uuid().nullable().optional(),
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  period_month: z.number().int().min(1).max(12),
  period_year: z.number().int().min(2020).max(2100),
  observations: z.string().optional(),
})

export type CreateReportInput = z.infer<typeof createReportSchema>
