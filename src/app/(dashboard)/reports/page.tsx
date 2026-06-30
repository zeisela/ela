import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { ReportCard } from '@/features/reports/components/ReportCard'
import { CreateReportDialog } from '@/features/reports/components/CreateReportDialog'
import { getReports } from '@/features/reports/repositories/report.repository'
import { EmptyState } from '@/components/data-display/EmptyState'
import { FileBarChart } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Reportes' }

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const [reports, { data: clientsData }, { data: plansData }] = await Promise.all([
    getReports(profile.organization_id),
    supabase.from('clients').select('id, name').eq('organization_id', profile.organization_id).is('deleted_at', null).order('name'),
    supabase.from('plans').select('id, name, client_id').eq('organization_id', profile.organization_id).order('name'),
  ])

  const clients = (clientsData ?? []) as { id: string; name: string }[]
  const plans = (plansData ?? []) as { id: string; name: string; client_id: string }[]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reportes"
        description="Genera y descarga reportes de cumplimiento por cliente y período."
        actions={<CreateReportDialog clients={clients} plans={plans} />}
      />

      {reports.length === 0 ? (
        <EmptyState
          icon={FileBarChart}
          title="Sin reportes"
          description="Crea tu primer reporte de cumplimiento."
        />
      ) : (
        <div className="space-y-2">
          {reports.map((report, i) => (
            <ReportCard key={report.id} report={report} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
