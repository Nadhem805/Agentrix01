import type { SubscriptionPlan } from './auth'

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer'

export interface WorkspaceMember {
  userId: string
  role: WorkspaceRole
  joinedAt: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  logoUrl?: string
  ownerId: string
  description?: string
  timezone: string
  defaultLanguage: string
  members: WorkspaceMember[]
  plan: SubscriptionPlan
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateWorkspaceData {
  name: string
  timezone: string
  defaultLanguage: string
  description?: string
}
