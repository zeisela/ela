'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Pencil, Trash2, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProgressBar } from '@/components/data-display/ProgressBar'
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog'
import { PlanForm } from './PlanForm'
import { deletePlanAction } from '../actions/plan.actions'
import { MONTHS, CONTENT_TYPE_LABELS } from '@/config/constants'
import type { Plan } from '@/types/database.types'

interface ContentCounts {
  post: number
  reel: number
  story: number
  carousel: number
}

interface PlanCardProps {
  plan: Plan
  clientId: string
  counts?: ContentCounts
}

export function PlanCard({ plan, clientId, counts }: PlanCardProps) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const goals = [
    { key: 'post', label: CONTENT_TYPE_LABELS.post, done: counts?.post ?? 0, goal: plan.posts_goal },
    { key: 'reel', label: CONTENT_TYPE_LABELS.reel, done: counts?.reel ?? 0, goal: plan.reels_goal },
    { key: 'story', label: CONTENT_TYPE_LABELS.story, done: counts?.story ?? 0, goal: plan.stories_goal },
    { key: 'carousel', label: CONTENT_TYPE_LABELS.carousel, done: counts?.carousel ?? 0, goal: plan.carousels_goal },
  ].filter((g) => g.goal > 0)

  const totalDone = goals.reduce((s, g) => s + g.done, 0)
  const totalGoal = goals.reduce((s, g) => s + g.goal, 0)
  const overallPct = totalGoal > 0 ? Math.round((totalDone / totalGoal) * 100) : 0

  function handleDelete() {
    startTransition(async () => {
      const result = await deletePlanAction(clientId, plan.id)
      if ('error' in result) toast.error(result.error)
      else toast.success('Plan eliminado')
      setDeleteOpen(false)
    })
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-medium">{plan.name}</CardTitle>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {MONTHS[plan.month - 1]} {plan.year}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant={plan.is_active ? 'default' : 'secondary'} className="text-[10px]">
                {plan.is_active ? 'Activo' : 'Inactivo'}
              </Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditOpen(true)}
                aria-label="Editar"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDeleteOpen(true)}
                aria-label="Eliminar"
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {goals.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin metas definidas</p>
          ) : (
            <>
              {goals.map((g) => (
                <ProgressBar key={g.key} label={g.label} value={g.done} max={g.goal} size="sm" />
              ))}
              <div className="flex items-center justify-between border-t pt-3">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Target className="h-3.5 w-3.5" />
                  Cumplimiento general
                </span>
                <span
                  className={`text-sm font-semibold ${
                    overallPct >= 100
                      ? 'text-green-600 dark:text-green-400'
                      : overallPct >= 75
                        ? 'text-blue-600 dark:text-blue-400'
                        : overallPct >= 50
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-red-500'
                  }`}
                >
                  {overallPct}%
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar plan</DialogTitle>
          </DialogHeader>
          <PlanForm
            clientId={clientId}
            planId={plan.id}
            mode="edit"
            defaultValues={{
              name: plan.name,
              month: plan.month,
              year: plan.year,
              posts_goal: plan.posts_goal,
              reels_goal: plan.reels_goal,
              stories_goal: plan.stories_goal,
              carousels_goal: plan.carousels_goal,
              is_active: plan.is_active,
            }}
            onSuccess={() => setEditOpen(false)}
            onCancel={() => setEditOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="¿Eliminar plan?"
        description={`Se eliminará el plan "${plan.name}". Los contenidos asociados no se borrarán.`}
        confirmLabel="Eliminar"
        variant="destructive"
        loading={isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
