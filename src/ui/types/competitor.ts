// types/competitor.ts

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
  avatarInitial?: string
  avatarColor?: string
  postCount?: number
  avgEngagementRate?: number
}

export interface CompetitorPost {
  id: string
  competitorId: string
  platformPostId: string
  permalink?: string
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