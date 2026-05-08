export type NotificationType =
  | 'post_published'
  | 'post_failed'
  | 'post_scheduled'
  | 'subscription_expiring'
  | 'subscription_expired'
  | 'low_activity_warning'
  | 'account_disconnected'
  | 'system_message'

export interface Notification {
  id: string
  userId: string
  workspaceId?: string
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, unknown>
  isRead: boolean
  expiresAt: string
  createdAt: string
}
