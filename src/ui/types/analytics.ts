import type { SocialPlatform } from './post'

export interface AnalyticsOverview {
  totalPosts: number
  totalEngagements: number
  avgEngagementRate: number
  followerGrowth: number
  topPlatform: SocialPlatform
  postingStreak: number
}

export interface PostAnalytics {
  postId: string
  platform: SocialPlatform
  impressions: number
  reach: number
  likes: number
  comments: number
  shares: number
  saves: number
  engagementRate: number
  publishedAt: string
}

export interface DateRange {
  from: Date
  to: Date
}

export interface TrendData {
  date: string
  value: number
}

export interface ActivityHeatmap {
  data: Array<{ dayOfWeek: number; hour: number; count: number }>
}
