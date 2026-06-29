import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getContentById } from '@/features/content/repositories/content.repository'
import { ContentTypeBadge } from '@/features/content/components/ContentTypeBadge'
import { ContentStatusBadge } from '@/features/content/components/ContentStatusBadge'
import { ContentStatusActions } from '@/features/content/components/ContentStatusActions'
import { AttachmentsPanel } from '@/features/content/components/AttachmentsPanel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { ContentType, ContentStatus, ContentAttachment } from '@/types/database.types'

export const metadata: Metadata = { title: 'Detalle de contenido' }

export default async function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('organization_id').eq('id', user.id).single()

  const { data: content, error } = await getContentById(profile!.organization_id, id)
  if (error || !content) notFound()

  const client = content.client as { id: string; name: string } | null
  const assignee = content.assignee as { id: string; full_name: string; avatar_url: string | null } | null
  const attachments = (content.attachments ?? []) as ContentAttachment[]

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <ContentTypeBadge type={content.type as ContentType} />
          <ContentStatusBadge status={content.status as ContentStatus} />
        </div>
        <h1 className="text-xl font-semibold">{content.title}</h1>
        {client && (
          <Link
            href={`/clients/${client.id}`}
            className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            {client.name}
          </Link>
        )}
      </div>

      {/* Quick actions */}
      <ContentStatusActions contentId={id} currentStatus={content.status as ContentStatus} />

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {content.scheduled_at && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Programado</p>
              <p className="font-medium">{formatDate(content.scheduled_at)}</p>
            </div>
          </div>
        )}
        {content.published_at && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Publicado</p>
              <p className="font-medium">{formatDate(content.published_at)}</p>
            </div>
          </div>
        )}
        {assignee && (
          <div className="flex items-center gap-2 text-sm">
            <Avatar className="h-7 w-7">
              <AvatarImage src={assignee.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">
                {assignee.full_name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">Responsable</p>
              <p className="font-medium">{assignee.full_name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Notes */}
      {content.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{content.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      <AttachmentsPanel contentId={id} attachments={attachments} />
    </div>
  )
}
