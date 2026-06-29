import { LoginForm } from '@/features/auth/components/LoginForm'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Bienvenido de vuelta</h1>
        <p className="text-sm text-muted-foreground">Ingresa tus credenciales para continuar</p>
      </div>

      <LoginForm />

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{' '}
        <Link href="/register" className="text-foreground underline underline-offset-4">
          Crear cuenta
        </Link>
      </p>
    </div>
  )
}
