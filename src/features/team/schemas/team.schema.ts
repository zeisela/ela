import { z } from 'zod'

export const inviteSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  role: z.enum(['admin', 'manager', 'editor', 'community_manager', 'designer']),
})

export const updateRoleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(['admin', 'manager', 'editor', 'community_manager', 'designer']),
})

export type InviteInput = z.infer<typeof inviteSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
