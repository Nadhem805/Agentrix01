// Scheduler API service — wired up in Phase 5
import type { CalendarPost } from '@/types/post'
import type { SocialPlatform } from '@/types/post'

export interface ScheduledPost {
  postId: string
  scheduledAt: string
  platforms: SocialPlatform[]
  status: string
  jobId: string
}

export const schedulerService = {
  schedulePost: async (
    _postId: string,
    _scheduledAt: Date,
    _platforms: SocialPlatform[]
  ): Promise<ScheduledPost> => {
    // TODO: POST /scheduler/schedule
    throw new Error('Not implemented')
  },

  reschedulePost: async (_postId: string, _newScheduledAt: Date): Promise<ScheduledPost> => {
    // TODO: PATCH /scheduler/:postId
    throw new Error('Not implemented')
  },

  cancelSchedule: async (_postId: string): Promise<void> => {
    // TODO: DELETE /scheduler/:postId
  },

  getCalendarPosts: async (
    _workspaceId: string,
    _month: number,
    _year: number
  ): Promise<CalendarPost[]> => {
    // TODO: GET /scheduler/calendar?workspaceId=&month=&year=
    throw new Error('Not implemented')
  },
}
