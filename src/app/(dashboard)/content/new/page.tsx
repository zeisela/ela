import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/layout/PageHeader'
import { ContentForm } from '@/features/content/components/ContentForm'

export const metadata: Metadata = { title: 'Nuevo contenido' }

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>
}) {
  const { client: preselectedClientId } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()

  const orgId = profile!.organization_id

  const [{ data: clients }, { data: teamMembers }, { data: plans }] = await Promise.all([
    supabase.from('clients').select('id, name').eq('organization_id', orgId)
      .eq('status', 'active').is('deleted_at', null).order('name'),
    supabase.from('profiles').select('id, full_name').eq('organization_id', orgId)
      .eq('is_active', true).order('full_name'),
    preselectedClientId
      ? supabase.from('plans').select('id, name, month, year').eq('client_id', preselectedClientId)
          .eq('organization_id', orgId).order('year', { ascending: false }).order('month', { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <PageHeader title="Nuevo contenido" description="Registra una publicación" />
      <ContentForm
        clients={clients ?? []}
        teamMembers={teamMembers ?? []}
        plans={plans ?? []}
        preselectedClientId={preselectedClientId}
        mode="create"
      />
    </div>
  )
}
