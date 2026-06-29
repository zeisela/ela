import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { ClientForm } from '@/features/clients/components/ClientForm'

export const metadata: Metadata = { title: 'Nuevo cliente' }

export default async function NewClientPage() {
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

  const { data: teamMembers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('organization_id', profile!.organization_id)
    .eq('is_active', true)
    .order('full_name')

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <PageHeader
        title="Nuevo cliente"
        description="Completa la información del cliente"
      />
      <ClientForm teamMembers={teamMembers ?? []} mode="create" />
    </div>
  )
}
