import { ipcMain } from 'electron'

// ─── Placeholder handlers ─────────────────────────────────────────────────────
// These will read/write from the SQLite notifications table once the DB schema
// is wired up in electron/services/database.ts

export function registerNotificationHandlers(): void {
  ipcMain.handle('notifications:list', async (_event, workspaceId: string, unreadOnly?: boolean) => {
    console.log('notifications:list', workspaceId, unreadOnly)
    return []
  })

  ipcMain.handle('notifications:markRead', async (_event, notificationId: string) => {
    console.log('notifications:markRead', notificationId)
    return { success: true }
  })

  ipcMain.handle('notifications:markAllRead', async (_event, workspaceId: string) => {
    console.log('notifications:markAllRead', workspaceId)
    return { success: true }
  })

  ipcMain.handle('notifications:unreadCount', async (_event, workspaceId: string) => {
    console.log('notifications:unreadCount', workspaceId)
    return 0
  })
}
