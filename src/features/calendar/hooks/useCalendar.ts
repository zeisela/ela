'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

export interface CalendarEvent {
  id: string
  title: string
  type: string
  status: string
  scheduled_at: string
  client: { id: string; name: string } | null
}

export function useCalendarEvents(year: number, month: number) {
  return useQuery({
    queryKey: ['calendar', year, month],
    queryFn: async (): Promise<CalendarEvent[]> => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No autenticado')

      const { data: profile } = await supabase
        .from('profiles').select('organization_id').eq('id', user.id).single()
      if (!profile) throw new Error('Perfil no encontrado')

      const start = `${year}-${String(month).padStart(2, '0')}-01`
      const end = new Date(year, month, 1).toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('content')
        .select('id, title, type, status, scheduled_at, client:clients(id, name)')
        .eq('organization_id', profile.organization_id)
        .gte('scheduled_at', start)
        .lt('scheduled_at', end)
        .is('deleted_at', null)
        .order('scheduled_at')

      if (error) throw error
      return (data ?? []).map((item) => ({
        ...item,
        client: (item.client as unknown) as { id: string; name: string } | null,
      }))
    },
  })
}
