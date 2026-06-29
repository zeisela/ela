import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getContentById } from '@/features/content/repositories/content.repository'
import { ContentForm } from '@/features/content/components/ContentForm'
import { PageHeader } from '@/components/layout/PageHeader'

export const metadata: Metadata = { title: 'Editar contenido' }

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()

  const orgId = profile!.organization_id
  const { data: content, error } = await getContentById(orgId, id)
  if (error || !content) notFound()

  const [{ data: clients }, { data: teamMembers }, { data: plans }] = await Promise.all([
    supabase.from('clients').select('id, name').eq('organization_id', orgId)
      .eq('status', 'active').is('deleted_at', null).order('name'),
    supabase.from('profiles').select('id, full_name').eq('organization_id', orgId)
      .eq('is_active', true).order('full_name'),
    supabase.from('plans').select('id, name, month, year').eq('client_id', content.client_id)
      .eq('organization_id', orgId).order('year', { ascending: false }),
  ])

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <PageHeader title="Editar contenido" />
      <ContentForm
        defaultValues={{
          id: content.id,
          title: content.title,
          type: content.type,
          status: content.status,
          client_id: content.client_id,
          plan_id: content.plan_id,
          scheduled_at: content.scheduled_at,
          published_at: content.published_at,
          assigned_to: content.assigned_to,
          notes: content.notes ?? '',
        }}
        clients={clients ?? []}
        teamMembers={teamMembers ?? []}
        plans={plans ?? []}
        mode="edit"
      />
    </div>
  )
}
