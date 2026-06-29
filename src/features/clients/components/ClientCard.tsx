'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Globe, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ClientAvatar } from './ClientAvatar'
import { ClientStatusBadge } from './ClientStatusBadge'
import type { ClientStatus } from '@/types/database.types'

interface ClientCardProps {
  client: {
    id: string
    name: string
    company: string | null
    logo_url: string | null
    instagram: string | null
    facebook: string | null
    status: ClientStatus
    assignee: { full_name: string } | null
  }
  index: number
  onDelete: (id: string, name: string) => void
}

export function ClientCard({ client, index, onDelete }: ClientCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <Card className="group transition-shadow hover:shadow-md">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/clients/${client.id}`} className="flex items-center gap-3 min-w-0">
              <ClientAvatar name={client.name} logoUrl={client.logo_url} />
              <div className="min-w-0">
                <p className="truncate font-medium text-sm">{client.name}</p>
                {client.company && (
                  <p className="truncate text-xs text-muted-foreground">{client.company}</p>
                )}
              </div>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md opacity-0 transition-colors hover:bg-accent group-hover:opacity-100"
                aria-label="Acciones"
              >
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => (window.location.href = `/clients/${client.id}/edit`)}>
                  <Pencil className="mr-2 h-3.5 w-3.5" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => onDelete(client.id, client.name)}
                >
                  <Trash2 className="mr-2 h-3.5 w-3.5" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <ClientStatusBadge status={client.status} />
            <div className="flex items-center gap-2 text-muted-foreground">
              {(client.instagram || client.facebook) && (
                <a
                  href={
                    client.instagram
                      ? `https://instagram.com/${client.instagram.replace('@', '')}`
                      : `https://facebook.com/${client.facebook}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Globe className="h-3.5 w-3.5 transition-colors hover:text-foreground" />
                </a>
              )}
            </div>
          </div>

          {client.assignee && (
            <p className="mt-3 text-[11px] text-muted-foreground">
              Responsable: {client.assignee.full_name}
            </p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
