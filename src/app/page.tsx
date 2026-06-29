import { redirect } from 'next/navigation'

// Root "/" is handled by (dashboard)/page.tsx — this file shouldn't be reached
// but acts as a safety redirect.
export default function RootPage() {
  redirect('/')
}
