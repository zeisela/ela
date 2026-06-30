import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { TeamTable } from '@/features/team/components/TeamTable'
import { InviteDialog } from '@/features/team/components/InviteDialog'
import { getTeamMembers } from '@/features/team/repositories/team.repository'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Equipo',
}

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('organization_id, role').eq('id', user.id).single()
  if (!profile) redirect('/login')

  const members = await getTeamMembers(profile.organization_id)
  const isAdmin = profile.role === 'admin'

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipo"
        description={`${members.length} miembro${members.length !== 1 ? 's' : ''} en la organización`}
        actions={isAdmin ? <InviteDialog /> : undefined}
      />
      <TeamTable
        members={members}
        currentUserId={user.id}
        isAdmin={isAdmin}
      />
    </div>
  )
}
