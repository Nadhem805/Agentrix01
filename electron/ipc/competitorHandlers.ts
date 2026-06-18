import type { IpcMain } from 'electron'
import { competitorService } from '../services/competitorService'

// Handles: competitor:add, competitor:remove, competitor:list,
//          competitor:sync, competitor:posts
export function registerCompetitorHandlers(ipcMain: IpcMain) {
  ipcMain.handle('competitor:list', async (_event, { workspaceId }: { workspaceId: string }) => {
    try {
      return await competitorService.listCompetitors(workspaceId)
    } catch (e: any) {
      console.error('[IPC] competitor:list failed:', e.message)
      throw e
    }
  })

  ipcMain.handle('competitor:add', async (_event, { workspaceId, platform, username }: { workspaceId: string; platform: string; username: string }) => {
    try {
      return await competitorService.addCompetitor(workspaceId, platform, username)
    } catch (e: any) {
      console.error('[IPC] competitor:add failed:', e.message)
      throw e
    }
  })

  ipcMain.handle('competitor:remove', async (_event, { id }: { id: string }) => {
    try {
      await competitorService.removeCompetitor(id)
      return { success: true }
    } catch (e: any) {
      console.error('[IPC] competitor:remove failed:', e.message)
      throw e
    }
  })

  ipcMain.handle('competitor:sync', async (_event, { id }: { id: string }) => {
    try {
      await competitorService.syncCompetitorPosts(id)
      return { success: true }
    } catch (e: any) {
      console.error('[IPC] competitor:sync failed:', e.message)
      throw e
    }
  })

  ipcMain.handle('competitor:posts', async (_event, { competitorId }: { competitorId: string }) => {
    try {
      return await competitorService.getCompetitorPosts(competitorId)
    } catch (e: any) {
      console.error('[IPC] competitor:posts failed:', e.message)
      throw e
    }
  })
}
