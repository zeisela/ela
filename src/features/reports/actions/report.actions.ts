'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createReportSchema, type CreateReportInput } from '../schemas/report.schema'

type ActionResult = { error: string } | { success: true; id: string }
type DeleteResult = { error: string } | { success: true }

export async function createReport(input: CreateReportInput): Promise<ActionResult> {
  const parsed = createReportSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) return { error: 'Perfil no encontrado' }

  const { data, error } = await supabase
    .from('reports')
    .insert({
      organization_id: profile.organization_id,
      client_id: parsed.data.client_id,
      plan_id: parsed.data.plan_id ?? null,
      title: parsed.data.title,
      period_month: parsed.data.period_month,
      period_year: parsed.data.period_year,
      observations: parsed.data.observations ?? null,
      generated_by: user.id,
    })
    .select('id')
    .single()

  if (error) return { error: 'Error al crear el reporte' }

  revalidatePath('/reports')
  return { success: true, id: data.id }
}

export async function deleteReport(reportId: string): Promise<DeleteResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) return { error: 'Perfil no encontrado' }

  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId)
    .eq('organization_id', profile.organization_id)

  if (error) return { error: 'Error al eliminar el reporte' }

  revalidatePath('/reports')
  return { success: true }
}
