import { createClient } from '@/lib/supabase/server'

export interface ClientCompliance {
  clientId: string
  clientName: string
  clientLogoUrl: string | null
  planId: string | null
  planName: string | null
  posts: { done: number; goal: number }
  reels: { done: number; goal: number }
  stories: { done: number; goal: number }
  carousels: { done: number; goal: number }
  overallPct: number
}

export async function getComplianceByMonth(
  orgId: string,
  month: number,
  year: number
): Promise<ClientCompliance[]> {
  const supabase = await createClient()

  // Get all active clients with their plan for this month
  const { data: plans } = await supabase
    .from('plans')
    .select(`
      id, name, client_id,
      posts_goal, reels_goal, stories_goal, carousels_goal,
      client:clients!inner(id, name, logo_url, status)
    `)
    .eq('organization_id', orgId)
    .eq('month', month)
    .eq('year', year)

  // Also get active clients without a plan this month
  const { data: allActiveClients } = await supabase
    .from('clients')
    .select('id, name, logo_url')
    .eq('organization_id', orgId)
    .eq('status', 'active')
    .is('deleted_at', null)

  const clientsWithPlan = new Set(plans?.map((p) => p.client_id) ?? [])

  // Get published content this month
  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
  const monthEnd = new Date(year, month, 1).toISOString().split('T')[0]

  const { data: published } = await supabase
    .from('content')
    .select('client_id, type')
    .eq('organization_id', orgId)
    .eq('status', 'published')
    .gte('published_at', monthStart)
    .lt('published_at', monthEnd)

  // Count per client per type
  const counts: Record<string, Record<string, number>> = {}
  for (const item of published ?? []) {
    if (!counts[item.client_id]) counts[item.client_id] = { post: 0, reel: 0, story: 0, carousel: 0 }
    counts[item.client_id][item.type] = (counts[item.client_id][item.type] ?? 0) + 1
  }

  const result: ClientCompliance[] = []

  // Clients with plans
  for (const plan of plans ?? []) {
    const client = plan.client as unknown as { id: string; name: string; logo_url: string | null; status: string }
    if (client.status !== 'active') continue

    const c = counts[plan.client_id] ?? {}
    const posts = { done: c.post ?? 0, goal: plan.posts_goal }
    const reels = { done: c.reel ?? 0, goal: plan.reels_goal }
    const stories = { done: c.story ?? 0, goal: plan.stories_goal }
    const carousels = { done: c.carousel ?? 0, goal: plan.carousels_goal }

    const totalDone = posts.done + reels.done + stories.done + carousels.done
    const totalGoal = posts.goal + reels.goal + stories.goal + carousels.goal
    const overallPct = totalGoal > 0 ? Math.round((totalDone / totalGoal) * 100) : 0

    result.push({
      clientId: plan.client_id,
      clientName: client.name,
      clientLogoUrl: client.logo_url,
      planId: plan.id,
      planName: plan.name,
      posts, reels, stories, carousels, overallPct,
    })
  }

  // Active clients without plan
  for (const client of allActiveClients ?? []) {
    if (clientsWithPlan.has(client.id)) continue
    const c = counts[client.id] ?? {}
    result.push({
      clientId: client.id,
      clientName: client.name,
      clientLogoUrl: client.logo_url,
      planId: null,
      planName: null,
      posts: { done: c.post ?? 0, goal: 0 },
      reels: { done: c.reel ?? 0, goal: 0 },
      stories: { done: c.story ?? 0, goal: 0 },
      carousels: { done: c.carousel ?? 0, goal: 0 },
      overallPct: 0,
    })
  }

  // Sort: with plans first, then by compliance desc
  return result.sort((a, b) => {
    if (a.planId && !b.planId) return -1
    if (!a.planId && b.planId) return 1
    return b.overallPct - a.overallPct
  })
}
