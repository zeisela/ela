import { z } from 'zod'

export const planSchema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
  posts_goal: z.number().int().min(0),
  reels_goal: z.number().int().min(0),
  stories_goal: z.number().int().min(0),
  carousels_goal: z.number().int().min(0),
  is_active: z.boolean(),
})

export type PlanInput = z.infer<typeof planSchema>
