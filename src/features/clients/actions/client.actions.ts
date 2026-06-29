'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { clientSchema, type ClientInput } from '../schemas/client.schema'

type ActionResult = { error: string } | { success: true; id?: string }

async function getOrgId(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('profiles').select('organization_id').eq('id', user.id).single()
  return data?.organization_id ?? null
}

export async function createClientAction(input: ClientInput): Promise<ActionResult> {
  const parsed = clientSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const orgId = await getOrgId()
  if (!orgId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .insert({ ...parsed.data, organization_id: orgId })
    .select('id')
    .single()

  if (error) return { error: 'Error al crear el cliente' }

  revalidatePath('/clients')
  return { success: true, id: data.id }
}

export async function updateClientAction(
  clientId: string,
  input: ClientInput
): Promise<ActionResult> {
  const parsed = clientSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const orgId = await getOrgId()
  if (!orgId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('clients')
    .update(parsed.data)
    .eq('id', clientId)
    .eq('organization_id', orgId)

  if (error) return { error: 'Error al actualizar el cliente' }

  revalidatePath('/clients')
  revalidatePath(`/clients/${clientId}`)
  return { success: true }
}

export async function deleteClientAction(clientId: string): Promise<ActionResult> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('clients')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', clientId)
    .eq('organization_id', orgId)

  if (error) return { error: 'Error al eliminar el cliente' }

  revalidatePath('/clients')
  return { success: true }
}

export async function uploadClientLogo(clientId: string, formData: FormData): Promise<ActionResult> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No autorizado' }

  const file = formData.get('logo') as File | null
  if (!file) return { error: 'No se proporcionó archivo' }

  if (file.size > 2 * 1024 * 1024) return { error: 'El logo debe ser menor a 2MB' }
  if (!file.type.startsWith('image/')) return { error: 'El archivo debe ser una imagen' }

  const supabase = await createClient()
  const ext = file.name.split('.').pop()
  const path = `${orgId}/clients/${clientId}/logo.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('client-assets')
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: 'Error al subir el logo' }

  const { data: urlData } = supabase.storage.from('client-assets').getPublicUrl(path)

  await supabase
    .from('clients')
    .update({ logo_url: urlData.publicUrl })
    .eq('id', clientId)
    .eq('organization_id', orgId)

  revalidatePath(`/clients/${clientId}`)
  return { success: true }
}
