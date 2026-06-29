'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { contentSchema, type ContentInput } from '../schemas/content.schema'

type ActionResult = { error: string } | { success: true; id?: string }

async function getAuthContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, organization_id')
    .eq('id', user.id)
    .single()
  if (!profile) return null
  return { supabase, userId: user.id, orgId: profile.organization_id }
}

export async function createContentAction(input: ContentInput): Promise<ActionResult> {
  const parsed = contentSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const ctx = await getAuthContext()
  if (!ctx) return { error: 'No autorizado' }

  const { data, error } = await ctx.supabase
    .from('content')
    .insert({
      ...parsed.data,
      organization_id: ctx.orgId,
      created_by: ctx.userId,
    })
    .select('id')
    .single()

  if (error) return { error: 'Error al crear el contenido' }

  revalidatePath('/content')
  revalidatePath(`/clients/${parsed.data.client_id}/content`)
  return { success: true, id: data.id }
}

export async function updateContentAction(
  contentId: string,
  input: ContentInput
): Promise<ActionResult> {
  const parsed = contentSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const ctx = await getAuthContext()
  if (!ctx) return { error: 'No autorizado' }

  const { error } = await ctx.supabase
    .from('content')
    .update(parsed.data)
    .eq('id', contentId)
    .eq('organization_id', ctx.orgId)

  if (error) return { error: 'Error al actualizar el contenido' }

  revalidatePath('/content')
  revalidatePath(`/content/${contentId}`)
  revalidatePath(`/clients/${parsed.data.client_id}/content`)
  return { success: true }
}

export async function updateContentStatusAction(
  contentId: string,
  status: ContentInput['status']
): Promise<ActionResult> {
  const ctx = await getAuthContext()
  if (!ctx) return { error: 'No autorizado' }

  const extra: Record<string, string> = {}
  if (status === 'published') extra.published_at = new Date().toISOString()

  const { error } = await ctx.supabase
    .from('content')
    .update({ status, ...extra })
    .eq('id', contentId)
    .eq('organization_id', ctx.orgId)

  if (error) return { error: 'Error al actualizar el estado' }

  revalidatePath('/content')
  revalidatePath(`/content/${contentId}`)
  return { success: true }
}

export async function deleteContentAction(contentId: string): Promise<ActionResult> {
  const ctx = await getAuthContext()
  if (!ctx) return { error: 'No autorizado' }

  const { error } = await ctx.supabase
    .from('content')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', contentId)
    .eq('organization_id', ctx.orgId)

  if (error) return { error: 'Error al eliminar el contenido' }

  revalidatePath('/content')
  return { success: true }
}

export async function uploadContentAttachment(
  contentId: string,
  formData: FormData
): Promise<ActionResult> {
  const ctx = await getAuthContext()
  if (!ctx) return { error: 'No autorizado' }

  const file = formData.get('file') as File | null
  if (!file) return { error: 'No se proporcionó archivo' }
  if (file.size > 50 * 1024 * 1024) return { error: 'El archivo debe ser menor a 50MB' }

  const ext = file.name.split('.').pop()
  const path = `${ctx.orgId}/content/${contentId}/${Date.now()}.${ext}`

  const { error: uploadError } = await ctx.supabase.storage
    .from('content-attachments')
    .upload(path, file)

  if (uploadError) return { error: 'Error al subir el archivo' }

  const { data: urlData } = ctx.supabase.storage.from('content-attachments').getPublicUrl(path)

  await ctx.supabase.from('content_attachments').insert({
    content_id: contentId,
    file_name: file.name,
    file_url: urlData.publicUrl,
    file_size: file.size,
    mime_type: file.type,
  })

  revalidatePath(`/content/${contentId}`)
  return { success: true }
}

export async function deleteAttachmentAction(attachmentId: string): Promise<ActionResult> {
  const ctx = await getAuthContext()
  if (!ctx) return { error: 'No autorizado' }

  const { error } = await ctx.supabase
    .from('content_attachments')
    .delete()
    .eq('id', attachmentId)

  if (error) return { error: 'Error al eliminar el adjunto' }
  return { success: true }
}
