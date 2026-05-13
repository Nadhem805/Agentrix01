// ─── Shared types used across the Electron main process ──────────────────────

export type SocialPlatform = 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'linkedin'
export type PostStatus     = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed'
export type AgentType      = 'analyzer' | 'planner' | 'creator'
export type ContentTone    = 'professional' | 'casual' | 'humorous' | 'inspirational' | 'educational'

export interface Profile {
  id: string
  name: string
  avatarPath?: string
  createdAt: string
  updatedAt: string
}

export interface Workspace {
  id: string
  profileId: string
  name: string
  timezone: string
  defaultLanguage: string
  createdAt: string
  updatedAt: string
}

export interface SocialAccount {
  id: string
  workspaceId: string
  platform: SocialPlatform
  platformUserId: string
  platformUsername: string
  platformDisplayName: string
  avatarUrl?: string
  accessToken: string       // AES-256-GCM encrypted at rest
  refreshToken?: string     // AES-256-GCM encrypted at rest
  tokenExpiresAt?: string
  scopes: string[]
  isActive: boolean
  lastSyncedAt?: string
  connectedAt: string
}

export interface Post {
  id: string
  workspaceId: string
  caption: string
  hashtags: string[]
  ctaNotes?: string
  status: PostStatus
  scheduledAt?: string
  publishedAt?: string
  failureReason?: string
  retryCount: number
  createdAt: string
  updatedAt: string
}

export interface MediaAsset {
  id: string
  workspaceId: string
  localPath: string
  fileName: string
  mimeType: string
  fileSizeBytes: number
  width?: number
  height?: number
  durationSeconds?: number
  createdAt: string
}

export interface Competitor {
  id: string
  workspaceId: string
  platform: SocialPlatform
  platformUsername: string
  platformUserId?: string
  displayName?: string
  avatarUrl?: string
  followerCount?: number
  lastSyncedAt?: string
  createdAt: string
}

export interface AgentRun {
  id: string
  workspaceId: string
  agentType: AgentType
  inputSnapshot: string
  outputSnapshot: string
  modelUsed: string
  durationMs: number
  status: 'running' | 'completed' | 'failed'
  errorMessage?: string
  createdAt: string
}

export interface OllamaConfig {
  baseUrl: string
  defaultModel: string
  timeoutMs: number
  maxTokens: number
  temperature: number
}
