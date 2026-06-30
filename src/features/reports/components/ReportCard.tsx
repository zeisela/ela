'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { FileBarChart, Trash2, ExternalLink, Printer } from 'lucide-react'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { MONTHS } from '@/config/constants'
import { deleteReport } from '../actions/report.actions'
import { toast } from 'sonner'
import type { ReportWithClient } from '../repositories/report.repository'

interface ReportCardProps {
  report: ReportWithClient
  index: number
}

export function ReportCard({ report, index }: ReportCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const result = await deleteReport(report.id)
    setLoading(false)
    if ('error' in result) toast.error(result.error)
    else toast.success('Reporte eliminado')
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="flex items-center justify-between gap-4 rounded-lg border bg-card px-4 py-3 hover:bg-accent/30 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <FileBarChart className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-sm">{report.title}</p>
            <p className="text-xs text-muted-foreground">
              {report.client?.name} · {MONTHS[report.period_month - 1]} {report.period_year}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => router.push(`/reports/${report.id}/print`)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
            title="Imprimir / Exportar PDF"
          >
            <Printer className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => router.push(`/reports/${report.id}`)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-accent transition-colors"
            title="Ver detalle"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setConfirmOpen(true)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Eliminar reporte"
        description={`¿Eliminar "${report.title}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
      />
    </>
  )
}
