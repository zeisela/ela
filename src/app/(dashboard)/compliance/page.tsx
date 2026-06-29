import type { Metadata } from 'next'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getComplianceByMonth } from '@/features/compliance/repositories/compliance.repository'
import { ComplianceCard } from '@/features/compliance/components/ComplianceCard'
import { ComplianceSummaryBar } from '@/features/compliance/components/ComplianceSummaryBar'
import { MonthSelector } from '@/features/compliance/components/MonthSelector'
import { PageHeader } from '@/components/layout/PageHeader'
import { EmptyState } from '@/components/data-display/EmptyState'
import { BarChart3 } from 'lucide-react'

export const metadata: Metadata = { title: 'Cumplimiento' }

async function ComplianceContent({
  month,
  year,
  orgId,
}: {
  month: number
  year: number
  orgId: string
}) {
  const data = await getComplianceByMonth(orgId, month, year)

  if (data.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Sin clientes activos"
        description="Agrega clientes y planes para ver el cumplimiento."
      />
    )
  }

  return (
    <div className="space-y-6">
      <ComplianceSummaryBar data={data} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.map((item) => (
          <ComplianceCard key={item.clientId} data={item} />
        ))}
      </div>
    </div>
  )
}

export default async function CompliancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>
}) {
  const { month: monthStr, year: yearStr } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()

  const now = new Date()
  const month = Number(monthStr ?? now.getMonth() + 1)
  const year = Number(yearStr ?? now.getFullYear())

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Cumplimiento"
        description="Seguimiento de metas mensuales por cliente"
        actions={
          <Suspense>
            <MonthSelector />
          </Suspense>
        }
      />
      <Suspense fallback={<div className="text-sm text-muted-foreground">Cargando...</div>}>
        <ComplianceContent month={month} year={year} orgId={profile!.organization_id} />
      </Suspense>
    </div>
  )
}
