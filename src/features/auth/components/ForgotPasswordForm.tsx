'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPassword } from '../actions/auth.actions'
import { forgotPasswordSchema, type ForgotPasswordInput } from '../schemas/auth.schema'

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setLoading(true)
    const result = await forgotPassword(data)
    setLoading(false)
    if ('error' in result) {
      toast.error(result.error)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border p-6 text-center">
        <CheckCircle className="h-10 w-10 text-green-500" />
        <div>
          <p className="font-medium">Email enviado</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="tu@agencia.com"
          autoComplete="email"
          {...form.register('email')}
        />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Enviar enlace de recuperación
      </Button>
    </form>
  )
}
