'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const html = document.documentElement
    html.classList.toggle('dark')
    setDark(html.classList.contains('dark'))
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggle}>
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}
