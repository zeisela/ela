import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPlansByClient } from '@/features/plans/repositories/plan.repository'
import { PlanCard } from '@/features/plans/components/PlanCard'
import { NewPlanButton } from '@/features/plans/components/NewPlanButton'
import { EmptyState } from '@/components/data-display/EmptyState'
import { PageHeader } from '@/components/layout/PageHeader'
import { Target } from 'lucide-react'
import type { Plan } from '@/types/database.types'

export const metadata: Metadata = { title: 'Planes del cliente' }

export default async function ClientPlansPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: client } = await supabase
    .from('clients').select('id, name').eq('id', id).eq('organization_id', profile.organization_id).single()
  if (!client) notFound()

  const { data: plans } = await getPlansByClient(profile.organization_id, id)

  // Get content counts per plan for current month
  const now = new Date()
  const planIds = plans.map((p) => p.id)
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  const { data: published } = planIds.length
    ? await supabase
        .from('content')
        .select('plan_id, type')
        .in('plan_id', planIds)
        .eq('status', 'published')
        .gte('published_at', monthStart)
    : { data: [] }

  // Build counts map per planId
  const countsMap: Record<string, { post: number; reel: number; story: number; carousel: number }> = {}
  for (const item of published ?? []) {
    if (!item.plan_id) continue
    if (!countsMap[item.plan_id]) countsMap[item.plan_id] = { post: 0, reel: 0, story: 0, carousel: 0 }
    const t = item.type as keyof typeof countsMap[string]
    if (t in countsMap[item.plan_id]) countsMap[item.plan_id][t]++
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`Planes — ${client.name}`}
        description="Metas mensuales de contenido"
        actions={<NewPlanButton clientId={id} />}
      />

      {plans.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Sin planes"
          description="Crea el primer plan de contenido para este cliente."
          action={<NewPlanButton clientId={id} />}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan as Plan}
              clientId={id}
              counts={countsMap[plan.id]}
            />
          ))}
        </div>
      )}
    </div>
  )
}
