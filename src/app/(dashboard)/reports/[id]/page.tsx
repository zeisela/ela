import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getReportById } from '@/features/reports/repositories/report.repository'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProgressBar } from '@/components/data-display/ProgressBar'
import { StatCard } from '@/components/data-display/StatCard'
import { ClientAvatar } from '@/features/clients/components/ClientAvatar'
import { ChevronLeft, Printer, FileText, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { CONTENT_TYPE_LABELS, MONTHS } from '@/config/constants'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Detalle del reporte' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReportDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const report = await getReportById(profile.organization_id, id)
  if (!report) notFound()

  // Fetch published content for this period
  const monthStart = `${report.period_year}-${String(report.period_month).padStart(2, '0')}-01`
  const monthEnd = new Date(report.period_year, report.period_month, 1).toISOString().split('T')[0]

  const { data: published } = await supabase
    .from('content')
    .select('type, status')
    .eq('client_id', report.client_id)
    .eq('status', 'published')
    .gte('published_at', monthStart)
    .lt('published_at', monthEnd)

  const counts = { post: 0, reel: 0, story: 0, carousel: 0 }
  for (const c of published ?? []) counts[c.type as keyof typeof counts]++
  const total = counts.post + counts.reel + counts.story + counts.carousel

  const plan = report.plan
  const bars = plan ? [
    { key: 'post', label: CONTENT_TYPE_LABELS.post, done: counts.post, goal: plan.posts_goal },
    { key: 'reel', label: CONTENT_TYPE_LABELS.reel, done: counts.reel, goal: plan.reels_goal },
    { key: 'story', label: CONTENT_TYPE_LABELS.story, done: counts.story, goal: plan.stories_goal },
    { key: 'carousel', label: CONTENT_TYPE_LABELS.carousel, done: counts.carousel, goal: plan.carousels_goal },
  ].filter((b) => b.goal > 0) : []

  const overallPct = bars.length > 0
    ? Math.round(bars.reduce((sum, b) => sum + Math.min(b.done / b.goal, 1), 0) / bars.length * 100)
    : null

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/reports"
          className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" />
          Volver a reportes
        </Link>
        <PageHeader
          title={report.title}
          description={`${MONTHS[report.period_month - 1]} ${report.period_year} · Generado el ${formatDate(report.created_at)}`}
          actions={
            <Link
              href={`/reports/${id}/print`}
              target="_blank"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <Printer className="h-3.5 w-3.5" />
              Exportar PDF
            </Link>
          }
        />
      </div>

      {/* Client info */}
      {report.client && (
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <ClientAvatar name={report.client.name} logoUrl={report.client.logo_url} size="lg" />
            <div>
              <p className="font-semibold">{report.client.name}</p>
              {report.client.company && <p className="text-sm text-muted-foreground">{report.client.company}</p>}
              {report.plan && <p className="mt-1 text-xs text-muted-foreground">Plan: {report.plan.name}</p>}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total publicado" value={total} icon={CheckCircle2} />
        <StatCard label="Posts" value={counts.post} />
        <StatCard label="Reels" value={counts.reel} />
        <StatCard label="Historias" value={counts.story} />
      </div>

      {/* Compliance bars */}
      {bars.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Cumplimiento del plan</CardTitle>
            {overallPct !== null && (
              <span className="text-2xl font-bold">{overallPct}%</span>
            )}
          </CardHeader>
          <CardContent className="space-y-5">
            {bars.map((bar) => (
              <ProgressBar key={bar.key} label={bar.label} value={bar.done} max={bar.goal} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Observations */}
      {report.observations && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Observaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.observations}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
