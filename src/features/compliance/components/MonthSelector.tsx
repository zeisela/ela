'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MONTHS } from '@/config/constants'

export function MonthSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  const now = new Date()
  const month = Number(params.get('month') ?? now.getMonth() + 1)
  const year = Number(params.get('year') ?? now.getFullYear())

  function navigate(delta: number) {
    let m = month + delta
    let y = year
    if (m > 12) { m = 1; y++ }
    if (m < 1) { m = 12; y-- }
    router.push(`${pathname}?month=${m}&year=${y}`)
  }

  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear()

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="icon-sm" onClick={() => navigate(-1)} aria-label="Mes anterior">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="min-w-36 text-center">
        <span className="text-sm font-medium">
          {MONTHS[month - 1]} {year}
        </span>
        {isCurrentMonth && (
          <span className="ml-2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
            hoy
          </span>
        )}
      </div>

      <Button variant="ghost" size="icon-sm" onClick={() => navigate(1)} aria-label="Mes siguiente">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
