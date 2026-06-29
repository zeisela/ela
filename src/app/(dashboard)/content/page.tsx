import type { Metadata } from 'next'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContentTable } from '@/features/content/components/ContentTable'

export const metadata: Metadata = { title: 'Contenidos' }

export default function ContentPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Contenidos"
        description="Todas las publicaciones de tus clientes"
      />
      <ContentTable showClientColumn />
    </div>
  )
}
