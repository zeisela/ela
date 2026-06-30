import { createClient } from '@/lib/supabase/server'
import type { ClientFile, FileCategory } from '@/types/database.types'

export interface FileFilters {
  client_id?: string
  category?: FileCategory
}

export type ClientFileWithClient = ClientFile & {
  client: { id: string; name: string } | null
}

export async function getClientFiles(
  orgId: string,
  filters: FileFilters = {}
): Promise<ClientFileWithClient[]> {
  const supabase = await createClient()

  let query = supabase
    .from('client_files')
    .select('*, client:clients(id, name)')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (filters.client_id) query = query.eq('client_id', filters.client_id)
  if (filters.category) query = query.eq('category', filters.category)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((item) => ({
    ...item,
    client: (item.client as unknown) as { id: string; name: string } | null,
  }))
}

export async function getFilesByClient(orgId: string, clientId: string): Promise<ClientFile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('client_files')
    .select('*')
    .eq('organization_id', orgId)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('category')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}
