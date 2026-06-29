import { createClient } from '@/lib/supabase/server'
import type { ClientStatus } from '@/types/database.types'

export interface ClientFilters {
  search?: string
  status?: ClientStatus | 'all'
  assigned_to?: string
  page?: number
  pageSize?: number
  orderBy?: string
  orderDir?: 'asc' | 'desc'
}

export async function getClients(orgId: string, filters: ClientFilters = {}) {
  const supabase = await createClient()
  const {
    search = '',
    status = 'all',
    page = 1,
    pageSize = 20,
    orderBy = 'name',
    orderDir = 'asc',
  } = filters

  let query = supabase
    .from('clients')
    .select(
      `
      id, name, company, logo_url, instagram, facebook, tiktok,
      status, start_date, created_at,
      assignee:profiles!clients_assigned_to_fkey(id, full_name, avatar_url)
    `,
      { count: 'exact' }
    )
    .eq('organization_id', orgId)
    .is('deleted_at', null)

  if (search) query = query.ilike('name', `%${search}%`)
  if (status && status !== 'all') query = query.eq('status', status)

  query = query.order(orderBy, { ascending: orderDir === 'asc' })

  const from = (page - 1) * pageSize
  query = query.range(from, from + pageSize - 1)

  const { data, count, error } = await query
  return { data: data ?? [], count: count ?? 0, error }
}

export async function getClientById(orgId: string, clientId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients')
    .select(
      `
      *,
      assignee:profiles!clients_assigned_to_fkey(id, full_name, avatar_url)
    `
    )
    .eq('id', clientId)
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .single()

  return { data, error }
}

export async function getClientStats(orgId: string, clientId: string) {
  const supabase = await createClient()
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`

  const [{ count: totalContent }, { count: publishedThisMonth }, { data: activePlan }] =
    await Promise.all([
      supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .is('deleted_at', null),
      supabase
        .from('content')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', clientId)
        .eq('status', 'published')
        .gte('published_at', monthStart),
      supabase
        .from('plans')
        .select('*')
        .eq('client_id', clientId)
        .eq('month', month)
        .eq('year', year)
        .single(),
    ])

  return {
    totalContent: totalContent ?? 0,
    publishedThisMonth: publishedThisMonth ?? 0,
    activePlan: activePlan ?? null,
  }
}
