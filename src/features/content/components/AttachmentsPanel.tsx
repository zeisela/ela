'use client'

import { useRef, useTransition } from 'react'
import { toast } from 'sonner'
import { Paperclip, Upload, Trash2, FileText, Image, Film } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { uploadContentAttachment, deleteAttachmentAction } from '../actions/content.actions'
import type { ContentAttachment } from '@/types/database.types'

interface AttachmentsPanelProps {
  contentId: string
  attachments: ContentAttachment[]
}

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return FileText
  if (mimeType.startsWith('image/')) return Image
  if (mimeType.startsWith('video/')) return Film
  return FileText
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function AttachmentsPanel({ contentId, attachments }: AttachmentsPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const fd = new FormData()
    fd.append('file', file)
    startTransition(async () => {
      const result = await uploadContentAttachment(contentId, fd)
      if ('error' in result) toast.error(result.error)
      else toast.success('Archivo subido')
    })
    e.target.value = ''
  }

  function handleDelete(id: string, name: string) {
    startTransition(async () => {
      const result = await deleteAttachmentAction(id)
      if ('error' in result) toast.error(result.error)
      else toast.success(`"${name}" eliminado`)
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-sm font-medium">
          Adjuntos {attachments.length > 0 && `(${attachments.length})`}
        </CardTitle>
        <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={isPending}>
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          Subir archivo
        </Button>
        <input ref={inputRef} type="file" className="hidden" onChange={handleUpload} />
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <Paperclip className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">Sin adjuntos</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {attachments.map((att) => {
              const Icon = getFileIcon(att.mime_type)
              return (
                <li
                  key={att.id}
                  className="group flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <a
                        href={att.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="truncate text-sm font-medium hover:underline"
                      >
                        {att.file_name}
                      </a>
                      {att.file_size && (
                        <p className="text-xs text-muted-foreground">{formatBytes(att.file_size)}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="opacity-0 group-hover:opacity-100"
                    onClick={() => handleDelete(att.id, att.file_name)}
                    disabled={isPending}
                    aria-label="Eliminar adjunto"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
