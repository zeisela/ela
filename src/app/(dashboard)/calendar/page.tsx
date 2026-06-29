import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PageHeader } from '@/components/layout/PageHeader'
import { CalendarView } from '@/features/calendar/components/CalendarView'
import { Skeleton } from '@/components/ui/skeleton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Calendario',
}

export default async function CalendarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendario"
        description="Visualiza y gestiona el contenido programado por mes, semana o lista."
      />
      <Suspense fallback={<Skeleton className="h-96 w-full rounded-lg" />}>
        <CalendarView />
      </Suspense>
    </div>
  )
}
