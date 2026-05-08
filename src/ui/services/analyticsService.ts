// Analytics API service — wired up in Phase 7
import type { AnalyticsOverview, PostAnalytics, DateRange, TrendData, ActivityHeatmap } from '@/types/analytics'

export const analyticsService = {
  getOverview: async (_workspaceId: string, _dateRange: DateRange): Promise<AnalyticsOverview> => {
    // TODO: GET /analytics/overview
    throw new Error('Not implemented')
  },

  getTopPosts: async (_workspaceId: string, _limit: number): Promise<PostAnalytics[]> => {
    // TODO: GET /analytics/top-posts
    throw new Error('Not implemented')
  },

  getEngagementTrend: async (_workspaceId: string, _dateRange: DateRange): Promise<TrendData[]> => {
    // TODO: GET /analytics/engagement-trend
    throw new Error('Not implemented')
  },

  getMostActiveDays: async (_workspaceId: string): Promise<ActivityHeatmap> => {
    // TODO: GET /analytics/active-days
    throw new Error('Not implemented')
  },

  syncAnalytics: async (_workspaceId: string): Promise<void> => {
    // TODO: POST /analytics/sync
  },
}
