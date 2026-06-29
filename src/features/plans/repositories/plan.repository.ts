import { createClient } from '@/lib/supabase/server'

export async function getPlansByClient(orgId: string, clientId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('organization_id', orgId)
    .eq('client_id', clientId)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  return { data: data ?? [], error }
}

export async function getPlanById(orgId: string, planId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('id', planId)
    .eq('organization_id', orgId)
    .single()

  return { data, error }
}

export async function getActivePlan(orgId: string, clientId: string, month: number, year: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('organization_id', orgId)
    .eq('client_id', clientId)
    .eq('month', month)
    .eq('year', year)
    .single()

  return { data, error }
}
