import { Notification as ElectronNotification, BrowserWindow } from 'electron'

export type NotificationType =
  | 'post_published'
  | 'post_failed'
  | 'post_scheduled'
  | 'agent_completed'
  | 'agent_failed'
  | 'sync_completed'
  | 'account_disconnected'
  | 'ollama_unavailable'
  | 'system_message'

export interface NotificationPayload {
  type: NotificationType
  title: string
  message: string
  metadata?: Record<string, string>
}

/**
 * Sends an OS-level desktop notification and forwards the event
 * to the renderer via IPC so the in-app notification center updates.
 */
export function sendNotification(
  win: BrowserWindow | null,
  payload: NotificationPayload
): void {
  // OS desktop notification
  if (ElectronNotification.isSupported()) {
    new ElectronNotification({
      title: payload.title,
      body: payload.message,
    }).show()
  }

  // Forward to renderer for in-app badge / notification list
  if (win && !win.isDestroyed()) {
    win.webContents.send('notification:new', payload)
  }
}
