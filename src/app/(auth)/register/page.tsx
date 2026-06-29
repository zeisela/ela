import { RegisterForm } from '@/features/auth/components/RegisterForm'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Crear cuenta' }

export default function RegisterPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Crea tu agencia</h1>
        <p className="text-sm text-muted-foreground">
          Configura tu cuenta y comienza en minutos
        </p>
      </div>

      <RegisterForm />

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="text-foreground underline underline-offset-4">
          Iniciar sesión
        </Link>
      </p>
    </div>
  )
}
