export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed'
export type SocialPlatform = 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'linkedin'

export interface MediaAsset {
  id: string
  workspaceId: string
  localPath: string             // Absolute path on local filesystem
  fileName: string
  mimeType: string
  fileSizeBytes: number
  width?: number
  height?: number
  durationSeconds?: number
  createdAt: string
}

export interface PostPlatformTarget {
  id: string
  postId: string
  platform: SocialPlatform
  socialAccountId: string
  platformPostId?: string
  permalink?: string
  status: PostStatus
  publishedAt?: string
  failureReason?: string
}

export interface Post {
  id: string
  workspaceId: string
  caption: string
  media: MediaAsset[]
  platforms: PostPlatformTarget[]
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

export interface CreatePostData {
  workspaceId: string
  caption: string
  mediaIds: string[]
  platforms: SocialPlatform[]
  hashtags: string[]
  ctaNotes?: string
  scheduledAt?: string
}

export interface CalendarPost {
  postId: string
  title: string
  scheduledAt: string
  platforms: SocialPlatform[]
  status: PostStatus
  mediaLocalPath?: string
}
