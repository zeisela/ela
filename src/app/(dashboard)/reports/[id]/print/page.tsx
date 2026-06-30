import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getReportById } from '@/features/reports/repositories/report.repository'
import { CONTENT_TYPE_LABELS, MONTHS } from '@/config/constants'
import { formatDate } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Imprimir reporte' }

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ReportPrintPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const report = await getReportById(profile.organization_id, id)
  if (!report) notFound()

  const monthStart = `${report.period_year}-${String(report.period_month).padStart(2, '0')}-01`
  const monthEnd = new Date(report.period_year, report.period_month, 1).toISOString().split('T')[0]

  const { data: published } = await supabase
    .from('content')
    .select('type')
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
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{report.title}</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111; background: #fff; padding: 40px; }
          h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
          h2 { font-size: 14px; font-weight: 600; margin-bottom: 12px; color: #333; }
          .subtitle { font-size: 13px; color: #666; margin-bottom: 32px; }
          .section { margin-bottom: 28px; }
          .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
          .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px; }
          .stat { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; text-align: center; }
          .stat-value { font-size: 28px; font-weight: 700; }
          .stat-label { font-size: 11px; color: #666; margin-top: 4px; }
          .bar-row { margin-bottom: 14px; }
          .bar-label { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 4px; }
          .bar-track { background: #f3f4f6; border-radius: 4px; height: 8px; }
          .bar-fill { height: 8px; border-radius: 4px; }
          .bar-green { background: #22c55e; }
          .bar-blue { background: #3b82f6; }
          .bar-amber { background: #f59e0b; }
          .bar-red { background: #ef4444; }
          .overall { text-align: right; font-size: 32px; font-weight: 700; margin-bottom: 16px; }
          .obs { font-size: 13px; color: #444; line-height: 1.6; white-space: pre-wrap; }
          .footer { margin-top: 48px; font-size: 11px; color: #999; border-top: 1px solid #e5e7eb; padding-top: 16px; }
          .print-btn { position: fixed; bottom: 24px; right: 24px; background: #111; color: #fff; border: none; border-radius: 8px; padding: 10px 20px; font-size: 13px; cursor: pointer; }
          @media print { .print-btn { display: none; } body { padding: 20px; } }
        `}</style>
      </head>
      <body>
        <button className="print-btn" id="print-btn">Imprimir / Guardar PDF</button>

        <h1>{report.title}</h1>
        <p className="subtitle">
          {report.client?.name}{report.client?.company ? ` · ${report.client.company}` : ''}
          {' '}&mdash;{' '}{MONTHS[report.period_month - 1]} {report.period_year}
          {report.plan ? ` · ${report.plan.name}` : ''}
        </p>

        <div className="stats">
          <div className="stat">
            <div className="stat-value">{total}</div>
            <div className="stat-label">Total publicado</div>
          </div>
          <div className="stat">
            <div className="stat-value">{counts.post}</div>
            <div className="stat-label">Posts</div>
          </div>
          <div className="stat">
            <div className="stat-value">{counts.reel}</div>
            <div className="stat-label">Reels</div>
          </div>
          <div className="stat">
            <div className="stat-value">{counts.story}</div>
            <div className="stat-label">Historias</div>
          </div>
        </div>

        {bars.length > 0 && (
          <div className="section card">
            <h2>Cumplimiento del plan</h2>
            {overallPct !== null && (
              <div className="overall">{overallPct}%</div>
            )}
            {bars.map((bar) => {
              const pct = Math.min(Math.round(bar.done / bar.goal * 100), 100)
              const colorClass = pct >= 100 ? 'bar-green' : pct >= 75 ? 'bar-blue' : pct >= 50 ? 'bar-amber' : 'bar-red'
              return (
                <div key={bar.key} className="bar-row">
                  <div className="bar-label">
                    <span>{bar.label}</span>
                    <span>{bar.done} / {bar.goal} ({pct}%)</span>
                  </div>
                  <div className="bar-track">
                    <div className={`bar-fill ${colorClass}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {report.observations && (
          <div className="section card" style={{ marginTop: 20 }}>
            <h2>Observaciones</h2>
            <p className="obs">{report.observations}</p>
          </div>
        )}

        <div className="footer">
          Generado el {formatDate(report.created_at)} · Social Control Dashboard
        </div>

        <script dangerouslySetInnerHTML={{ __html: 'document.querySelector(".print-btn").addEventListener("click", function(){ window.print(); })' }} />
      </body>
    </html>
  )
}
