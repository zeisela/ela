import { createClient } from '@/lib/supabase/server'
import type { Report } from '@/types/database.types'

export type ReportWithClient = Report & {
  client: { id: string; name: string; company: string | null; logo_url: string | null } | null
  plan: { id: string; name: string; posts_goal: number; reels_goal: number; stories_goal: number; carousels_goal: number } | null
}

export async function getReports(orgId: string, clientId?: string): Promise<ReportWithClient[]> {
  const supabase = await createClient()
  let query = supabase
    .from('reports')
    .select('*, client:clients(id, name, company, logo_url), plan:plans(id, name, posts_goal, reels_goal, stories_goal, carousels_goal)')
    .eq('organization_id', orgId)
    .order('period_year', { ascending: false })
    .order('period_month', { ascending: false })

  if (clientId) query = query.eq('client_id', clientId)

  const { data, error } = await query
  if (error) throw error

  return (data ?? []).map((r) => ({
    ...r,
    client: (r.client as unknown) as ReportWithClient['client'],
    plan: (r.plan as unknown) as ReportWithClient['plan'],
  }))
}

export async function getReportById(orgId: string, reportId: string): Promise<ReportWithClient | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reports')
    .select('*, client:clients(id, name, company, logo_url), plan:plans(id, name, posts_goal, reels_goal, stories_goal, carousels_goal)')
    .eq('organization_id', orgId)
    .eq('id', reportId)
    .single()

  if (!data) return null
  return {
    ...data,
    client: (data.client as unknown) as ReportWithClient['client'],
    plan: (data.plan as unknown) as ReportWithClient['plan'],
  }
}
