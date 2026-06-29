import { Suspense } from 'react'
import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { ClientsGrid } from '@/features/clients/components/ClientsGrid'
import { CardGridSkeleton } from '@/components/feedback/LoadingSkeleton'

export const metadata: Metadata = { title: 'Clientes' }

export default function ClientsPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Clientes"
        description="Gestiona todos tus clientes y su información"
      />
      <Suspense fallback={<CardGridSkeleton count={12} />}>
        <ClientsGrid />
      </Suspense>
    </div>
  )
}
