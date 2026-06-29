import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Recuperar contraseña' }

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Recupera tu contraseña</h1>
        <p className="text-sm text-muted-foreground">
          Te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      <ForgotPasswordForm />

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-foreground underline underline-offset-4">
          ← Volver al inicio de sesión
        </Link>
      </p>
    </div>
  )
}
