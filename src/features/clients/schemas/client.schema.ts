import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  company: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
  status: z.enum(['active', 'inactive', 'paused', 'churned']),
  assigned_to: z.string().uuid().optional().nullable(),
  start_date: z.string().optional().nullable(),
  notes: z.string().optional(),
})

export type ClientInput = z.infer<typeof clientSchema>
