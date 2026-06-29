import { createClient } from '@/lib/supabase/server'
import type { ContentStatus, ContentType } from '@/types/database.types'

export interface ContentFilters {
  clientId?: string
  type?: ContentType | 'all'
  status?: ContentStatus | 'all'
  search?: string
  month?: number
  year?: number
  page?: number
  pageSize?: number
}

export async function getContent(orgId: string, filters: ContentFilters = {}) {
  const supabase = await createClient()
  const {
    clientId,
    type = 'all',
    status = 'all',
    search = '',
    page = 1,
    pageSize = 20,
  } = filters

  let query = supabase
    .from('content')
    .select(
      `id, title, type, status, scheduled_at, published_at, created_at,
       client:clients(id, name, logo_url),
       assignee:profiles!content_assigned_to_fkey(id, full_name, avatar_url)`,
      { count: 'exact' }
    )
    .eq('organization_id', orgId)
    .is('deleted_at', null)

  if (clientId) query = query.eq('client_id', clientId)
  if (type !== 'all') query = query.eq('type', type)
  if (status !== 'all') query = query.eq('status', status)
  if (search) query = query.ilike('title', `%${search}%`)

  if (filters.year && filters.month) {
    const start = `${filters.year}-${String(filters.month).padStart(2, '0')}-01`
    const end = new Date(filters.year, filters.month, 1).toISOString().split('T')[0]
    query = query.gte('scheduled_at', start).lt('scheduled_at', end)
  }

  query = query.order('scheduled_at', { ascending: false, nullsFirst: false })
  query = query.order('created_at', { ascending: false })

  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data, count, error } = await query
  return { data: data ?? [], count: count ?? 0, error }
}

export async function getContentById(orgId: string, contentId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('content')
    .select(
      `*, client:clients(id, name, logo_url),
       assignee:profiles!content_assigned_to_fkey(id, full_name, avatar_url),
       attachments:content_attachments(*)`
    )
    .eq('id', contentId)
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .single()

  return { data, error }
}

export async function getContentForCalendar(orgId: string, year: number, month: number) {
  const supabase = await createClient()
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = new Date(year, month, 1).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('content')
    .select('id, title, type, status, scheduled_at, client:clients(id, name)')
    .eq('organization_id', orgId)
    .gte('scheduled_at', start)
    .lt('scheduled_at', end)
    .is('deleted_at', null)
    .order('scheduled_at')

  return { data: data ?? [], error }
}
