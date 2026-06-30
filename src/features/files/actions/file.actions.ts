'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { uploadFileSchema } from '../schemas/file.schema'

type ActionResult = { error: string } | { success: true; file_url: string }
type DeleteResult = { error: string } | { success: true }

export async function uploadClientFile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) return { error: 'Perfil no encontrado' }

  const parsed = uploadFileSchema.safeParse({
    client_id: formData.get('client_id'),
    category: formData.get('category'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const file = formData.get('file') as File | null
  if (!file || file.size === 0) return { error: 'No se seleccionó ningún archivo' }
  if (file.size > 50 * 1024 * 1024) return { error: 'El archivo no puede superar 50 MB' }

  const ext = file.name.split('.').pop() ?? ''
  const path = `${profile.organization_id}/${parsed.data.client_id}/${parsed.data.category}/${Date.now()}.${ext}`

  const { error: storageError } = await supabase.storage
    .from('client-files')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (storageError) return { error: 'Error al subir el archivo' }

  const { data: { publicUrl } } = supabase.storage.from('client-files').getPublicUrl(path)

  const { error: dbError } = await supabase.from('client_files').insert({
    organization_id: profile.organization_id,
    client_id: parsed.data.client_id,
    category: parsed.data.category,
    file_name: file.name,
    file_url: publicUrl,
    file_size: file.size,
    mime_type: file.type,
    uploaded_by: user.id,
  })

  if (dbError) {
    await supabase.storage.from('client-files').remove([path])
    return { error: 'Error al guardar el archivo' }
  }

  revalidatePath('/files')
  revalidatePath(`/clients/${parsed.data.client_id}`)
  return { success: true, file_url: publicUrl }
}

export async function deleteClientFile(fileId: string): Promise<DeleteResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) return { error: 'Perfil no encontrado' }

  const { error } = await supabase
    .from('client_files')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', fileId)
    .eq('organization_id', profile.organization_id)

  if (error) return { error: 'Error al eliminar el archivo' }

  revalidatePath('/files')
  return { success: true }
}
