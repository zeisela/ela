import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface ClientAvatarProps {
  name: string
  logoUrl?: string | null
  size?: 'sm' | 'md' | 'lg'
}

const SIZE: Record<string, string> = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-14 w-14 text-lg',
}

export function ClientAvatar({ name, logoUrl, size = 'md' }: ClientAvatarProps) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <Avatar className={cn(SIZE[size], 'rounded-lg')}>
      <AvatarImage src={logoUrl ?? undefined} alt={name} className="object-cover" />
      <AvatarFallback className="rounded-lg bg-muted font-semibold text-muted-foreground">
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}
