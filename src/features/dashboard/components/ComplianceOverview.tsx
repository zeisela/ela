import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/data-display/ProgressBar'
import { EmptyState } from '@/components/data-display/EmptyState'
import { BarChart3 } from 'lucide-react'
import { CONTENT_TYPE_LABELS } from '@/config/constants'

interface Props {
  orgId: string
  month: number
  year: number
}

export async function ComplianceOverview({ orgId, month, year }: Props) {
  const supabase = await createClient()

  const { data: plans } = await supabase
    .from('plans')
    .select(`
      *,
      clients!inner(name, status)
    `)
    .eq('organization_id', orgId)
    .eq('month', month)
    .eq('year', year)
    .eq('clients.status', 'active')
    .limit(5)

  if (!plans || plans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Cumplimiento del mes</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={BarChart3}
            title="Sin planes este mes"
            description="Crea planes para tus clientes para ver el cumplimiento."
          />
        </CardContent>
      </Card>
    )
  }

  const monthStart = `${year}-${String(month).padStart(2, '0')}-01`

  const totals = { posts: 0, reels: 0, stories: 0, carousels: 0 }
  const goals = { posts: 0, reels: 0, stories: 0, carousels: 0 }

  for (const plan of plans) {
    goals.posts += plan.posts_goal
    goals.reels += plan.reels_goal
    goals.stories += plan.stories_goal
    goals.carousels += plan.carousels_goal
  }

  const planIds = plans.map((p) => p.id)

  const { data: published } = await supabase
    .from('content')
    .select('type')
    .eq('organization_id', orgId)
    .in('plan_id', planIds)
    .eq('status', 'published')
    .gte('published_at', monthStart)

  for (const item of published ?? []) {
    if (item.type === 'post') totals.posts++
    else if (item.type === 'reel') totals.reels++
    else if (item.type === 'story') totals.stories++
    else if (item.type === 'carousel') totals.carousels++
  }

  const bars = [
    { key: 'post', label: CONTENT_TYPE_LABELS.post, done: totals.posts, goal: goals.posts },
    { key: 'reel', label: CONTENT_TYPE_LABELS.reel, done: totals.reels, goal: goals.reels },
    { key: 'story', label: CONTENT_TYPE_LABELS.story, done: totals.stories, goal: goals.stories },
    { key: 'carousel', label: CONTENT_TYPE_LABELS.carousel, done: totals.carousels, goal: goals.carousels },
  ].filter((b) => b.goal > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Cumplimiento del mes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {bars.map((bar) => (
          <ProgressBar
            key={bar.key}
            label={bar.label}
            value={bar.done}
            max={bar.goal}
          />
        ))}
      </CardContent>
    </Card>
  )
}
