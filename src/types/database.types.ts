export type UserRole = 'admin' | 'manager' | 'editor' | 'community_manager' | 'designer'
export type ClientStatus = 'active' | 'inactive' | 'paused' | 'churned'
export type ContentType = 'post' | 'reel' | 'carousel' | 'story'
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'cancelled'
export type FileCategory = 'brandbook' | 'logo' | 'video' | 'photo' | 'manual' | 'other'
export type AuditAction = 'create' | 'update' | 'delete' | 'restore'

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url: string | null
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Profile {
  id: string
  organization_id: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  organization_id: string
  name: string
  company: string | null
  logo_url: string | null
  instagram: string | null
  facebook: string | null
  tiktok: string | null
  status: ClientStatus
  assigned_to: string | null
  start_date: string | null
  notes: string | null
  meta: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface Plan {
  id: string
  organization_id: string
  client_id: string
  name: string
  month: number
  year: number
  posts_goal: number
  reels_goal: number
  stories_goal: number
  carousels_goal: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Content {
  id: string
  organization_id: string
  client_id: string
  plan_id: string | null
  title: string
  type: ContentType
  status: ContentStatus
  scheduled_at: string | null
  published_at: string | null
  assigned_to: string | null
  notes: string | null
  external_id: string | null
  platform_data: Record<string, unknown>
  created_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface ContentAttachment {
  id: string
  content_id: string
  file_name: string
  file_url: string
  file_size: number | null
  mime_type: string | null
  created_at: string
}

export interface ClientFile {
  id: string
  organization_id: string
  client_id: string
  category: FileCategory
  file_name: string
  file_url: string
  file_size: number | null
  mime_type: string | null
  uploaded_by: string | null
  created_at: string
  deleted_at: string | null
}

export interface Report {
  id: string
  organization_id: string
  client_id: string
  plan_id: string | null
  title: string
  period_month: number
  period_year: number
  observations: string | null
  pdf_url: string | null
  generated_by: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  body: string | null
  type: string
  read: boolean
  metadata: Record<string, unknown>
  created_at: string
}

export interface AuditLog {
  id: string
  org_id: string | null
  user_id: string | null
  action: AuditAction
  table_name: string
  record_id: string
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// Joined types for UI
export interface ClientWithAssignee extends Client {
  assignee: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
}

export interface ContentWithRelations extends Content {
  client: Pick<Client, 'id' | 'name' | 'logo_url'>
  assignee: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null
  attachments: ContentAttachment[]
}

export interface ComplianceStats {
  posts_done: number
  posts_goal: number
  reels_done: number
  reels_goal: number
  stories_done: number
  stories_goal: number
  carousels_done: number
  carousels_goal: number
  overall_percentage: number
}
