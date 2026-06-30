'use client'

import { useState } from 'react'
import { Upload, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/data-display/EmptyState'
import { FileCard } from './FileCard'
import { UploadFileDialog } from './UploadFileDialog'
import type { ClientFileWithClient } from '../repositories/file.repository'

interface Client {
  id: string
  name: string
}

interface FilesGridProps {
  files: ClientFileWithClient[]
  clients: Client[]
  showClient?: boolean
  defaultClientId?: string
}

export function FilesGrid({ files, clients, showClient, defaultClientId }: FilesGridProps) {
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <>
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setUploadOpen(true)}>
          <Upload className="mr-1.5 h-4 w-4" />
          Subir archivo
        </Button>
      </div>

      {files.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="Sin archivos"
          description="No hay archivos en esta categoría. Sube el primero."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {files.map((file, i) => (
            <FileCard
              key={file.id}
              file={file}
              index={i}
              showClient={showClient}
              clientName={file.client?.name}
            />
          ))}
        </div>
      )}

      <UploadFileDialog
        clients={clients}
        defaultClientId={defaultClientId}
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />
    </>
  )
}
