import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { StatCard } from '@/components/data-display/StatCard'
import { Users, AlertCircle, FileText, TrendingUp, Film, LayoutGrid, BookImage } from 'lucide-react'
import { MONTHS } from '@/config/constants'
import { RecentActivity } from '@/features/dashboard/components/RecentActivity'
import { ComplianceOverview } from '@/features/dashboard/components/ComplianceOverview'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/login')

  const orgId = profile.organization_id
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()

  const [
    { count: totalClients },
    { data: allClients },
    { count: publishedThisMonth },
    { count: reelsThisMonth },
    { count: carouselsThisMonth },
    { count: storiesThisMonth },
  ] = await Promise.all([
    supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'active'),
    supabase
      .from('clients')
      .select('id, status')
      .eq('organization_id', orgId)
      .in('status', ['active', 'paused']),
    supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('status', 'published')
      .gte('published_at', `${year}-${String(month).padStart(2, '0')}-01`),
    supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('type', 'reel')
      .eq('status', 'published')
      .gte('published_at', `${year}-${String(month).padStart(2, '0')}-01`),
    supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('type', 'carousel')
      .eq('status', 'published')
      .gte('published_at', `${year}-${String(month).padStart(2, '0')}-01`),
    supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', orgId)
      .eq('type', 'story')
      .eq('status', 'published')
      .gte('published_at', `${year}-${String(month).padStart(2, '0')}-01`),
  ])

  const delayedClients = allClients?.filter((c) => c.status === 'paused').length ?? 0

  return (
    <div className="p-6 space-y-8">
      <PageHeader
        title="Dashboard"
        description={`${MONTHS[month - 1]} ${year}`}
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Clientes activos"
          value={totalClients ?? 0}
          icon={Users}
          description="Con plan activo"
        />
        <StatCard
          label="Clientes atrasados"
          value={delayedClients}
          icon={AlertCircle}
          description="Con cumplimiento bajo"
        />
        <StatCard
          label="Publicaciones"
          value={publishedThisMonth ?? 0}
          icon={FileText}
          description="Realizadas este mes"
        />
        <StatCard
          label="Cumplimiento"
          value="—"
          icon={TrendingUp}
          description="Promedio general"
        />
      </div>

      {/* Content type stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Reels" value={reelsThisMonth ?? 0} icon={Film} />
        <StatCard label="Carruseles" value={carouselsThisMonth ?? 0} icon={LayoutGrid} />
        <StatCard label="Historias" value={storiesThisMonth ?? 0} icon={BookImage} />
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ComplianceOverview orgId={orgId} month={month} year={year} />
        <RecentActivity orgId={orgId} />
      </div>
    </div>
  )
}
