import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { FileCategoryTabs } from '@/features/files/components/FileCategoryTabs'
import { FilesGrid } from '@/features/files/components/FilesGrid'
import { getClientFiles } from '@/features/files/repositories/file.repository'
import { Skeleton } from '@/components/ui/skeleton'
import type { Metadata } from 'next'
import type { FileCategory } from '@/types/database.types'

export const metadata: Metadata = {
  title: 'Archivos',
}

interface PageProps {
  searchParams: Promise<{ category?: string; client_id?: string }>
}

export default async function FilesPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const params = await searchParams
  const category = params.category as FileCategory | undefined
  const client_id = params.client_id

  const [files, clientsData] = await Promise.all([
    getClientFiles(profile.organization_id, { category, client_id }),
    supabase
      .from('clients')
      .select('id, name')
      .eq('organization_id', profile.organization_id)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order('name'),
  ])

  const clients = (clientsData.data ?? []) as { id: string; name: string }[]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Archivos"
        description="Centro de archivos por cliente: brandbooks, logos, videos y más."
      />
      <Suspense fallback={<Skeleton className="h-10 w-full" />}>
        <FileCategoryTabs />
      </Suspense>
      <FilesGrid files={files} clients={clients} showClient />
    </div>
  )
}
