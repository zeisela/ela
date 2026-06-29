'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useClients } from '../hooks/useClients'
import { deleteClientAction } from '../actions/client.actions'
import { ClientCard } from './ClientCard'
import { ClientFilters } from './ClientFilters'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { EmptyState } from '@/components/data-display/EmptyState'
import { CardGridSkeleton } from '@/components/feedback/LoadingSkeleton'
import { Users } from 'lucide-react'
import { useDebounce } from '@/hooks/useDebounce'
import type { ClientStatus } from '@/types/database.types'

interface PaginationProps {
  page: number
  total: number
  pageSize: number
  onPageChange: (p: number) => void
}

function Pagination({ page, total, pageSize, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} de {total} clientes
      </span>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Siguiente
        </Button>
      </div>
    </div>
  )
}

export function ClientsGrid() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ClientStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const [isPending, startTransition] = useTransition()

  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useClients({
    search: debouncedSearch,
    status,
    page,
    pageSize: 12,
  })

  function handleSearchChange(v: string) {
    setSearch(v)
    setPage(1)
  }

  function handleStatusChange(v: ClientStatus | 'all') {
    setStatus(v)
    setPage(1)
  }

  function handleDelete(id: string, name: string) {
    setDeleteTarget({ id, name })
  }

  function confirmDelete() {
    if (!deleteTarget) return
    startTransition(async () => {
      const result = await deleteClientAction(deleteTarget.id)
      if ('error' in result) {
        toast.error(result.error)
      } else {
        toast.success(`${deleteTarget.name} eliminado`)
      }
      setDeleteTarget(null)
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <ClientFilters
          search={search}
          status={status}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
        />
        <Button size="sm" onClick={() => router.push('/clients/new')}>
          <Plus className="mr-1.5 h-4 w-4" />
          Nuevo cliente
        </Button>
      </div>

      {isLoading ? (
        <CardGridSkeleton count={12} />
      ) : !data?.data.length ? (
        <EmptyState
          icon={Users}
          title="Sin clientes"
          description={
            search || status !== 'all'
              ? 'No hay clientes que coincidan con los filtros.'
              : 'Crea tu primer cliente para comenzar.'
          }
          action={
            !search && status === 'all' ? (
              <Button size="sm" onClick={() => router.push('/clients/new')}>
                <Plus className="mr-1.5 h-4 w-4" />
                Crear cliente
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.data.map((client, i) => (
              <ClientCard
                key={client.id}
                client={client as unknown as Parameters<typeof ClientCard>[0]['client']}
                index={i}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <Pagination
            page={page}
            total={data.count}
            pageSize={12}
            onPageChange={setPage}
          />
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="¿Eliminar cliente?"
        description={`Se eliminará "${deleteTarget?.name}". Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="destructive"
        loading={isPending}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
