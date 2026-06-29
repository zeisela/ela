'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { ContentStatus, ContentType } from '@/types/database.types'

interface UseContentParams {
  clientId?: string
  type?: ContentType | 'all'
  status?: ContentStatus | 'all'
  search?: string
  page?: number
  pageSize?: number
}

export function useContent(params: UseContentParams = {}) {
  const { clientId, type = 'all', status = 'all', search = '', page = 1, pageSize = 20 } = params

  return useQuery({
    queryKey: ['content', clientId, type, status, search, page, pageSize],
    queryFn: async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const { data: profile } = await supabase
        .from('profiles').select('organization_id').eq('id', user.id).single()
      if (!profile) throw new Error('Perfil no encontrado')

      let query = supabase
        .from('content')
        .select(
          `id, title, type, status, scheduled_at, published_at, created_at,
           client:clients(id, name, logo_url),
           assignee:profiles!content_assigned_to_fkey(id, full_name, avatar_url)`,
          { count: 'exact' }
        )
        .eq('organization_id', profile.organization_id)
        .is('deleted_at', null)

      if (clientId) query = query.eq('client_id', clientId)
      if (type !== 'all') query = query.eq('type', type as ContentType)
      if (status !== 'all') query = query.eq('status', status as ContentStatus)
      if (search) query = query.ilike('title', `%${search}%`)

      query = query
        .order('scheduled_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })

      const from = (page - 1) * pageSize
      query = query.range(from, from + pageSize - 1)

      const { data, count, error } = await query
      if (error) throw error
      return { data: data ?? [], count: count ?? 0 }
    },
    placeholderData: (prev) => prev,
  })
}
