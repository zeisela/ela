import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClientById } from '@/features/clients/repositories/client.repository'
import { PageHeader } from '@/components/layout/PageHeader'
import { ClientForm } from '@/features/clients/components/ClientForm'

export const metadata: Metadata = { title: 'Editar cliente' }

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  const { data: client, error } = await getClientById(profile!.organization_id, id)
  if (error || !client) notFound()

  const { data: teamMembers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('organization_id', profile!.organization_id)
    .eq('is_active', true)
    .order('full_name')

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <PageHeader
        title={`Editar — ${client.name}`}
        description="Actualiza la información del cliente"
      />
      <ClientForm
        defaultValues={{
          id: client.id,
          name: client.name,
          company: client.company ?? '',
          instagram: client.instagram ?? '',
          facebook: client.facebook ?? '',
          tiktok: client.tiktok ?? '',
          status: client.status,
          assigned_to: client.assigned_to,
          start_date: client.start_date,
          notes: client.notes ?? '',
        }}
        teamMembers={teamMembers ?? []}
        mode="edit"
      />
    </div>
  )
}
