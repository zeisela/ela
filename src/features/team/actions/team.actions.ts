'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { inviteSchema, updateRoleSchema } from '../schemas/team.schema'
import type { InviteInput, UpdateRoleInput } from '../schemas/team.schema'

type ActionResult = { error: string } | { success: true }

function getAdminClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function inviteTeamMember(input: InviteInput): Promise<ActionResult> {
  const parsed = inviteSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles').select('organization_id, role').eq('id', user.id).single()
  if (!profile) return { error: 'Perfil no encontrado' }
  if (profile.role !== 'admin' && profile.role !== 'manager') {
    return { error: 'Sin permisos para invitar usuarios' }
  }

  const adminClient = getAdminClient()

  // Check if email already exists in org
  const { data: existing } = await adminClient
    .from('profiles')
    .select('id')
    .eq('organization_id', profile.organization_id)

  const { data: authUsers } = await adminClient.auth.admin.listUsers()
  const existingEmails = authUsers?.users
    ?.filter((u) => existing?.some((p) => p.id === u.id))
    .map((u) => u.email) ?? []

  if (existingEmails.includes(parsed.data.email)) {
    return { error: 'Este usuario ya pertenece a la organización' }
  }

  const { data: newUser, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: {
        full_name: parsed.data.full_name,
        organization_id: profile.organization_id,
      },
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/`,
    }
  )

  if (inviteError) return { error: 'Error al enviar la invitación' }

  // Set role on the profile (trigger creates it on signup, but we pre-set via upsert)
  if (newUser?.user) {
    await adminClient
      .from('profiles')
      .upsert({
        id: newUser.user.id,
        organization_id: profile.organization_id,
        full_name: parsed.data.full_name,
        role: parsed.data.role,
        is_active: false,
      })
  }

  revalidatePath('/team')
  return { success: true }
}

export async function updateMemberRole(input: UpdateRoleInput): Promise<ActionResult> {
  const parsed = updateRoleSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles').select('organization_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return { error: 'Sin permisos' }

  if (parsed.data.user_id === user.id) return { error: 'No puedes cambiar tu propio rol' }

  const { error } = await supabase
    .from('profiles')
    .update({ role: parsed.data.role })
    .eq('id', parsed.data.user_id)
    .eq('organization_id', profile.organization_id)

  if (error) return { error: 'Error al actualizar el rol' }

  revalidatePath('/team')
  return { success: true }
}

export async function toggleMemberActive(userId: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles').select('organization_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return { error: 'Sin permisos' }

  if (userId === user.id) return { error: 'No puedes desactivarte a ti mismo' }

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId)
    .eq('organization_id', profile.organization_id)

  if (error) return { error: 'Error al actualizar el estado' }

  revalidatePath('/team')
  return { success: true }
}

export async function removeMember(userId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles').select('organization_id, role').eq('id', user.id).single()
  if (!profile || profile.role !== 'admin') return { error: 'Sin permisos' }

  if (userId === user.id) return { error: 'No puedes eliminarte a ti mismo' }

  const adminClient = getAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) return { error: 'Error al eliminar el usuario' }

  revalidatePath('/team')
  return { success: true }
}
