import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database.types'

export async function getTeamMembers(orgId: string): Promise<Profile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', orgId)
    .order('full_name')

  if (error) throw error
  return data ?? []
}

export async function getTeamMemberById(orgId: string, userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', orgId)
    .eq('id', userId)
    .single()
  return data
}
