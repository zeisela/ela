import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClientById } from '@/features/clients/repositories/client.repository'
import { getClientFiles } from '@/features/files/repositories/file.repository'
import { PageHeader } from '@/components/layout/PageHeader'
import { FileCategoryTabs } from '@/features/files/components/FileCategoryTabs'
import { FilesGrid } from '@/features/files/components/FilesGrid'
import { ClientAvatar } from '@/features/clients/components/ClientAvatar'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import type { Metadata } from 'next'
import type { FileCategory } from '@/types/database.types'

export const metadata: Metadata = { title: 'Archivos del cliente' }

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ category?: string }>
}

export default async function ClientFilesPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const { data: client, error } = await getClientById(profile.organization_id, id)
  if (error || !client) notFound()

  const sp = await searchParams
  const category = sp.category as FileCategory | undefined

  const [files, { data: clientList }] = await Promise.all([
    getClientFiles(profile.organization_id, { client_id: id, category }),
    supabase
      .from('clients')
      .select('id, name')
      .eq('organization_id', profile.organization_id)
      .is('deleted_at', null)
      .order('name'),
  ])

  const clients = (clientList ?? []) as { id: string; name: string }[]

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/clients/${id}`}
          className="mb-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3 w-3" />
          Volver al cliente
        </Link>
        <PageHeader
          title={
            <div className="flex items-center gap-3">
              <ClientAvatar name={client.name} logoUrl={client.logo_url} size="sm" />
              <span>Archivos — {client.name}</span>
            </div>
          }
          description={`${files.length} archivo${files.length !== 1 ? 's' : ''}`}
        />
      </div>

      <FileCategoryTabs />
      <FilesGrid files={files} clients={clients} defaultClientId={id} />
    </div>
  )
}
