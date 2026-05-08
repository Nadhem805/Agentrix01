import type { SocialPlatform } from './post'

export type ConnectionStatus = 'active' | 'expired' | 'revoked' | 'error'

export interface SocialAccount {
  id: string
  workspaceId: string
  platform: SocialPlatform
  platformUserId: string
  platformUsername: string
  platformDisplayName: string
  avatarUrl?: string
  tokenExpiresAt?: string
  scopes: string[]
  isActive: boolean
  lastSyncedAt?: string
  connectedAt: string
  updatedAt: string
}
