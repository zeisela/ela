'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Eye, Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EmptyState } from '@/components/data-display/EmptyState'
import { TableSkeleton } from '@/components/feedback/LoadingSkeleton'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { ContentTypeBadge } from './ContentTypeBadge'
import { ContentStatusBadge } from './ContentStatusBadge'
import { useContent } from '../hooks/useContent'
import { deleteContentAction } from '../actions/content.actions'
import { useDebounce } from '@/hooks/useDebounce'
import { formatShortDate } from '@/lib/utils'
import { CONTENT_TYPE_LABELS, CONTENT_STATUS_LABELS } from '@/config/constants'
import type { ContentStatus, ContentType } from '@/types/database.types'

interface ContentTableProps {
  clientId?: string
  showClientColumn?: boolean
}

export function ContentTable({ clientId, showClientColumn = true }: ContentTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [type, setType] = useState<ContentType | 'all'>('all')
  const [status, setStatus] = useState<ContentStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useContent({
    clientId,
    type,
    status,
    search: debouncedSearch,
    page,
    pageSize: 15,
  })

  const pageSize = 15
  const totalPages = Math.ceil((data?.count ?? 0) / pageSize)

  function handleDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteContentAction(deleteTarget.id)
      if ('error' in result) toast.error(result.error)
      else toast.success('Contenido eliminado')
      setDeleteTarget(null)
    })
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar contenido..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="h-8 w-48 pl-8 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <Select value={type} onValueChange={(v) => { setType(v as ContentType | 'all'); setPage(1) }}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los tipos</SelectItem>
            {Object.entries(CONTENT_TYPE_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={(v) => { setStatus(v as ContentStatus | 'all'); setPage(1) }}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(CONTENT_STATUS_LABELS).map(([v, l]) => (
              <SelectItem key={v} value={v}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto">
          <Button
            size="sm"
            onClick={() =>
              router.push(clientId ? `/content/new?client=${clientId}` : '/content/new')
            }
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Nuevo contenido
          </Button>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <TableSkeleton rows={8} cols={showClientColumn ? 5 : 4} />
      ) : !data?.data.length ? (
        <EmptyState
          icon={Search}
          title="Sin contenido"
          description="No se encontraron publicaciones con los filtros seleccionados."
        />
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Título</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Tipo</th>
                {showClientColumn && (
                  <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-muted-foreground md:table-cell">
                    Cliente
                  </th>
                )}
                <th className="hidden px-4 py-2.5 text-left text-xs font-medium text-muted-foreground lg:table-cell">
                  Fecha
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {data.data.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="group border-b last:border-b-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium leading-none">{item.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <ContentTypeBadge type={item.type as ContentType} />
                    </td>
                    {showClientColumn && (
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {(item.client as unknown as { name: string } | null)?.name ?? '—'}
                      </td>
                    )}
                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {item.scheduled_at ? formatShortDate(item.scheduled_at) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <ContentStatusBadge status={item.status as ContentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => router.push(`/content/${item.id}`)}
                          aria-label="Ver"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => router.push(`/content/${item.id}/edit`)}
                          aria-label="Editar"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTarget({ id: item.id, title: item.title })}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Página {page} de {totalPages} · {data?.count} resultados
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Anterior
            </Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="¿Eliminar contenido?"
        description={`Se eliminará "${deleteTarget?.title}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="destructive"
        loading={isPending}
        onConfirm={handleDelete}
      />
    </div>
  )
}
