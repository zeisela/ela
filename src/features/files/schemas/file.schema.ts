import { z } from 'zod'

export const uploadFileSchema = z.object({
  client_id: z.string().uuid('Cliente inválido'),
  category: z.enum(['brandbook', 'logo', 'video', 'photo', 'manual', 'other']),
})

export type UploadFileInput = z.infer<typeof uploadFileSchema>

export const FILE_CATEGORY_ICONS: Record<string, string> = {
  brandbook: 'BookOpen',
  logo: 'Image',
  video: 'Video',
  photo: 'Camera',
  manual: 'FileText',
  other: 'File',
}

export const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  brandbook: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  logo: ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'],
  video: ['video/mp4', 'video/quicktime', 'video/webm'],
  photo: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  manual: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  other: [],
}
