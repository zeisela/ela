import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClientById, getClientStats } from '@/features/clients/repositories/client.repository'
import { ClientAvatar } from '@/features/clients/components/ClientAvatar'
import { ClientStatusBadge } from '@/features/clients/components/ClientStatusBadge'
import { StatCard } from '@/components/data-display/StatCard'
import { ProgressBar } from '@/components/data-display/ProgressBar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Pencil, AtSign, Globe, Calendar, FileText } from 'lucide-react'
import Link from 'next/link'
import { CONTENT_TYPE_LABELS, MONTHS } from '@/config/constants'
import { formatDate } from '@/lib/utils'

export const metadata: Metadata = { title: 'Detalle de cliente' }

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  const { data: client, error } = await getClientById(profile!.organization_id, id)
  if (error || !client) notFound()

  const stats = await getClientStats(profile!.organization_id, id)
  const now = new Date()
  const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`

  const plan = stats.activePlan as {
    posts_goal: number; reels_goal: number; stories_goal: number; carousels_goal: number
  } | null

  // Count per type this month
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const { data: published } = await supabase
    .from('content')
    .select('type')
    .eq('client_id', id)
    .eq('status', 'published')
    .gte('published_at', monthStart)

  const counts = { post: 0, reel: 0, story: 0, carousel: 0 }
  for (const c of published ?? []) counts[c.type as keyof typeof counts]++

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <ClientAvatar name={client.name} logoUrl={client.logo_url} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{client.name}</h1>
              <ClientStatusBadge status={client.status} />
            </div>
            {client.company && (
              <p className="text-sm text-muted-foreground">{client.company}</p>
            )}
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              {client.instagram && (
                <a
                  href={`https://instagram.com/${client.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <AtSign className="h-3 w-3" />
                  {client.instagram}
                </a>
              )}
              {client.facebook && (
                <a
                  href={`https://facebook.com/${client.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground"
                >
                  <Globe className="h-3 w-3" />
                  {client.facebook}
                </a>
              )}
              {client.start_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Desde {formatDate(client.start_date)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Link
            href={`/clients/${id}/content`}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted"
          >
            <FileText className="h-3.5 w-3.5" />
            Contenidos
          </Link>
          <Link
            href={`/clients/${id}/edit`}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-[0.8rem] font-medium text-primary-foreground transition-colors hover:bg-primary/80"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total contenido" value={stats.totalContent} icon={FileText} />
        <StatCard
          label="Publicado este mes"
          value={stats.publishedThisMonth}
          description={monthLabel}
        />
        <StatCard label="Posts" value={counts.post} />
        <StatCard label="Reels" value={counts.reel} />
      </div>

      {/* Compliance */}
      {plan && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Cumplimiento — {monthLabel}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {[
              { key: 'post', label: CONTENT_TYPE_LABELS.post, done: counts.post, goal: plan.posts_goal },
              { key: 'reel', label: CONTENT_TYPE_LABELS.reel, done: counts.reel, goal: plan.reels_goal },
              { key: 'story', label: CONTENT_TYPE_LABELS.story, done: counts.story, goal: plan.stories_goal },
              { key: 'carousel', label: CONTENT_TYPE_LABELS.carousel, done: counts.carousel, goal: plan.carousels_goal },
            ]
              .filter((b) => b.goal > 0)
              .map((bar) => (
                <ProgressBar key={bar.key} label={bar.label} value={bar.done} max={bar.goal} />
              ))}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
