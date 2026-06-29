'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ClientStatus } from '@/types/database.types'

interface UseClientsParams {
  search?: string
  status?: ClientStatus | 'all'
  page?: number
  pageSize?: number
  orderBy?: string
  orderDir?: 'asc' | 'desc'
}

export function useClients(params: UseClientsParams = {}) {
  const {
    search = '',
    status = 'all',
    page = 1,
    pageSize = 20,
    orderBy = 'name',
    orderDir = 'asc',
  } = params

  return useQuery({
    queryKey: ['clients', search, status, page, pageSize, orderBy, orderDir],
    queryFn: async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()
      if (!profile) throw new Error('Perfil no encontrado')

      let query = supabase
        .from('clients')
        .select(
          `id, name, company, logo_url, instagram, facebook, tiktok,
           status, start_date, created_at,
           assignee:profiles!clients_assigned_to_fkey(id, full_name, avatar_url)`,
          { count: 'exact' }
        )
        .eq('organization_id', profile.organization_id)
        .is('deleted_at', null)

      if (search) query = query.ilike('name', `%${search}%`)
      if (status && status !== 'all') query = query.eq('status', status as ClientStatus)

      query = query.order(orderBy, { ascending: orderDir === 'asc' })

      const from = (page - 1) * pageSize
      query = query.range(from, from + pageSize - 1)

      const { data, count, error } = await query
      if (error) throw error

      return { data: data ?? [], count: count ?? 0 }
    },
    placeholderData: (prev) => prev,
  })
}
