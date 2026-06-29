'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { register } from '../actions/auth.actions'
import { registerSchema, type RegisterInput } from '../schemas/auth.schema'

export function RegisterForm() {
  const [loading, setLoading] = useState(false)

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      full_name: '',
      email: '',
      organization_name: '',
      password: '',
      confirm_password: '',
    },
  })

  async function onSubmit(data: RegisterInput) {
    setLoading(true)
    const result = await register(data)
    setLoading(false)
    if (result && 'error' in result) {
      toast.error(result.error)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full_name">Nombre completo</Label>
        <Input id="full_name" placeholder="María González" {...form.register('full_name')} />
        {form.formState.errors.full_name && (
          <p className="text-xs text-destructive">{form.formState.errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="organization_name">Nombre de la agencia</Label>
        <Input
          id="organization_name"
          placeholder="Mi Agencia Digital"
          {...form.register('organization_name')}
        />
        {form.formState.errors.organization_name && (
          <p className="text-xs text-destructive">
            {form.formState.errors.organization_name.message}
          </p>
        )}
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...form.register('password')}
        />
        {form.formState.errors.password && (
          <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm_password">Confirmar contraseña</Label>
        <Input
          id="confirm_password"
          type="password"
          autoComplete="new-password"
          {...form.register('confirm_password')}
        />
        {form.formState.errors.confirm_password && (
          <p className="text-xs text-destructive">
            {form.formState.errors.confirm_password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Crear cuenta
      </Button>
    </form>
  )
}
