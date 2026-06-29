import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ContentTable } from '@/features/content/components/ContentTable'
import { PageHeader } from '@/components/layout/PageHeader'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Contenido del cliente' }

export default async function ClientContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()

  const { data: client } = await supabase
    .from('clients').select('id, name').eq('id', id)
    .eq('organization_id', profile!.organization_id).single()
  if (!client) notFound()

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`Contenido — ${client.name}`}
        description="Publicaciones registradas para este cliente"
        actions={
          <Link
            href={`/clients/${id}/plans`}
            className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium transition-colors hover:bg-muted"
          >
            Ver planes
          </Link>
        }
      />
      <ContentTable clientId={id} showClientColumn={false} />
    </div>
  )
}
