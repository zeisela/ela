'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Trash2, FileText, Image, Video, Camera, BookOpen, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { FILE_CATEGORY_LABELS } from '@/config/constants'
import { deleteClientFile } from '../actions/file.actions'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { ClientFile } from '@/types/database.types'

const CATEGORY_ICONS = {
  brandbook: BookOpen,
  logo: Image,
  video: Video,
  photo: Camera,
  manual: FileText,
  other: File,
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isImage(mime: string | null): boolean {
  return !!mime && mime.startsWith('image/')
}

interface FileCardProps {
  file: ClientFile
  index: number
  showClient?: boolean
  clientName?: string
}

export function FileCard({ file, index, showClient, clientName }: FileCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const Icon = CATEGORY_ICONS[file.category] ?? File

  async function handleDelete() {
    setLoading(true)
    const result = await deleteClientFile(file.id)
    setLoading(false)
    if ('error' in result) toast.error(result.error)
    else toast.success('Archivo eliminado')
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.04 }}
        className="group relative rounded-lg border bg-card overflow-hidden hover:shadow-sm transition-shadow"
      >
        {/* Preview / Icon area */}
        <div className="flex h-32 items-center justify-center bg-muted/40">
          {isImage(file.mime_type) ? (
            <img
              src={file.file_url}
              alt={file.file_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <Icon className="h-10 w-10 text-muted-foreground/50" />
          )}
        </div>

        {/* Actions overlay */}
        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <a
            href={file.file_url}
            download={file.file_name}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-background/90 shadow-sm hover:bg-background transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={() => setConfirmOpen(true)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-background/90 shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Info */}
        <div className="p-3">
          <p className="truncate text-sm font-medium" title={file.file_name}>
            {file.file_name}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{FILE_CATEGORY_LABELS[file.category]}</span>
            <span className="text-xs text-muted-foreground">{formatFileSize(file.file_size)}</span>
          </div>
          {showClient && clientName && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">{clientName}</p>
          )}
          <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(file.created_at)}</p>
        </div>
      </motion.div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar archivo"
        description={`¿Eliminar "${file.file_name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  )
}
