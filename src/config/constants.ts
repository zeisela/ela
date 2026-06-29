export const APP_NAME = 'Social Control Dashboard'

export const CONTENT_TYPE_LABELS: Record<string, string> = {
  post: 'Post',
  reel: 'Reel',
  carousel: 'Carrusel',
  story: 'Historia',
}

export const CONTENT_TYPE_COLORS: Record<string, string> = {
  post: 'bg-blue-500',
  reel: 'bg-purple-500',
  carousel: 'bg-amber-500',
  story: 'bg-green-500',
}

export const CONTENT_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  scheduled: 'Programado',
  published: 'Publicado',
  cancelled: 'Cancelado',
}

export const CLIENT_STATUS_LABELS: Record<string, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
  paused: 'Pausado',
  churned: 'Cancelado',
}

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  manager: 'Gerente',
  editor: 'Editor',
  community_manager: 'Community Manager',
  designer: 'Diseñador',
}

export const FILE_CATEGORY_LABELS: Record<string, string> = {
  brandbook: 'Brandbook',
  logo: 'Logos',
  video: 'Videos',
  photo: 'Fotografías',
  manual: 'Manuales',
  other: 'Otros',
}

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export const PAGINATION_DEFAULT_PAGE_SIZE = 20
