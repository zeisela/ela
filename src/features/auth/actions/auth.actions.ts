'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { loginSchema, registerSchema, forgotPasswordSchema } from '../schemas/auth.schema'
import type { LoginInput, RegisterInput, ForgotPasswordInput } from '../schemas/auth.schema'

type ActionResult = { error: string } | { success: true }

export async function login(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) return { error: 'Email o contraseña incorrectos' }

  redirect('/')
}

export async function register(input: RegisterInput): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const adminClient = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Create organization first
  const slug = parsed.data.organization_name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  const { data: org, error: orgError } = await adminClient
    .from('organizations')
    .insert({ name: parsed.data.organization_name, slug: `${slug}-${Date.now()}` })
    .select('id')
    .single()

  if (orgError) return { error: 'Error al crear la organización' }

  const { error: signUpError } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      full_name: parsed.data.full_name,
      organization_id: org.id,
    },
  })

  if (signUpError) {
    await adminClient.from('organizations').delete().eq('id', org.id)
    return { error: 'Error al crear la cuenta. El email puede ya estar en uso.' }
  }

  // Update profile role to admin (first user = admin)
  await adminClient
    .from('profiles')
    .update({ role: 'admin' })
    .eq('organization_id', org.id)

  const supabase = await createClient()
  await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  redirect('/')
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/update-password`,
  })

  if (error) return { error: 'Error al enviar el email' }

  return { success: true }
}

export async function logout(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
