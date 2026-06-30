'use client'

import { useState, useRef } from 'react'
import { Upload, X, File as FileIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FILE_CATEGORY_LABELS } from '@/config/constants'
import { uploadClientFile } from '../actions/file.actions'
import { toast } from 'sonner'
import type { FileCategory } from '@/types/database.types'

const CATEGORIES: FileCategory[] = ['brandbook', 'logo', 'video', 'photo', 'manual', 'other']

interface Client {
  id: string
  name: string
}

interface UploadFileDialogProps {
  clients: Client[]
  defaultClientId?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function UploadFileDialog({ clients, defaultClientId, open, onOpenChange }: UploadFileDialogProps) {
  const [clientId, setClientId] = useState(defaultClientId ?? '')
  const [category, setCategory] = useState<FileCategory | ''>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) setSelectedFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) setSelectedFile(file)
  }

  async function handleUpload() {
    if (!selectedFile || !clientId || !category) {
      toast.error('Completa todos los campos')
      return
    }
    setLoading(true)
    const fd = new FormData()
    fd.append('file', selectedFile)
    fd.append('client_id', clientId)
    fd.append('category', category)

    const result = await uploadClientFile(fd)
    setLoading(false)

    if ('error' in result) {
      toast.error(result.error)
    } else {
      toast.success('Archivo subido correctamente')
      setSelectedFile(null)
      setCategory('')
      if (!defaultClientId) setClientId('')
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Subir archivo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!defaultClientId && (
            <div className="space-y-1.5">
              <Label>Cliente</Label>
              <Select value={clientId} onValueChange={(v) => setClientId(v ?? '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>Categoría</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as FileCategory)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{FILE_CATEGORY_LABELS[cat]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Archivo</Label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-4 transition-colors hover:border-muted-foreground/50 hover:bg-muted/40"
            >
              {selectedFile ? (
                <div className="flex items-center gap-2 text-sm">
                  <FileIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium truncate max-w-40">{selectedFile.name}</span>
                  <span className="text-muted-foreground">{formatFileSize(selectedFile.size)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null) }}
                    className="ml-1 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-6 w-6 text-muted-foreground/50" />
                  <p className="text-xs text-muted-foreground text-center">
                    Arrastra un archivo aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-muted-foreground/60">Máximo 50 MB</p>
                </>
              )}
              <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              className="flex-1"
              onClick={handleUpload}
              disabled={loading || !selectedFile || !clientId || !category}
            >
              {loading ? 'Subiendo...' : 'Subir archivo'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
