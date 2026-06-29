import { z } from 'zod'

export const contentSchema = z.object({
  title: z.string().min(2, 'El título es requerido'),
  type: z.enum(['post', 'reel', 'carousel', 'story']),
  status: z.enum(['draft', 'scheduled', 'published', 'cancelled']),
  client_id: z.string().uuid('Cliente requerido'),
  plan_id: z.string().uuid().optional().nullable(),
  scheduled_at: z.string().optional().nullable(),
  published_at: z.string().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  notes: z.string().optional(),
})

export type ContentInput = z.infer<typeof contentSchema>
