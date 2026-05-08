import type { SocialPlatform } from './post'

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

export interface CompetitorPost {
  id: string
  competitorId: string
  platformPostId: string
  caption?: string
  hashtags: string[]
  mediaType: 'image' | 'video' | 'carousel' | 'reel'
  likes: number
  comments: number
  shares: number
  views?: number
  engagementRate: number
  postedAt: string
  fetchedAt: string
}
