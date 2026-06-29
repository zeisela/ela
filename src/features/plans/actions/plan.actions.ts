'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { planSchema, type PlanInput } from '../schemas/plan.schema'

type ActionResult = { error: string } | { success: true; id?: string }

async function getOrgId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  return data?.organization_id ?? null
}

export async function createPlanAction(clientId: string, input: PlanInput): Promise<ActionResult> {
  const parsed = planSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const orgId = await getOrgId()
  if (!orgId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plans')
    .insert({ ...parsed.data, client_id: clientId, organization_id: orgId })
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') return { error: 'Ya existe un plan para ese mes y año' }
    return { error: 'Error al crear el plan' }
  }

  revalidatePath(`/clients/${clientId}`)
  revalidatePath(`/clients/${clientId}/plans`)
  return { success: true, id: data.id }
}

export async function updatePlanAction(
  clientId: string,
  planId: string,
  input: PlanInput
): Promise<ActionResult> {
  const parsed = planSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const orgId = await getOrgId()
  if (!orgId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('plans')
    .update(parsed.data)
    .eq('id', planId)
    .eq('organization_id', orgId)

  if (error) return { error: 'Error al actualizar el plan' }

  revalidatePath(`/clients/${clientId}/plans`)
  revalidatePath(`/clients/${clientId}`)
  return { success: true }
}

export async function deletePlanAction(clientId: string, planId: string): Promise<ActionResult> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', planId)
    .eq('organization_id', orgId)

  if (error) return { error: 'Error al eliminar el plan' }

  revalidatePath(`/clients/${clientId}/plans`)
  revalidatePath(`/clients/${clientId}`)
  return { success: true }
}
