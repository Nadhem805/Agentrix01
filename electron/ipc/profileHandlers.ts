import type { IpcMain } from 'electron'
import { profileService } from '../services/profileService'

export function registerProfileHandlers(ipcMain: IpcMain) {
  ipcMain.handle('profile:get-active', async () => {
    try {
      return await profileService.getActiveProfile()
    } catch (e: any) {
      console.error('[IPC] profile:get-active failed:', e.message)
      throw e
    }
  })

  ipcMain.handle('profile:create', async (_event, data: any) => {
    try {
      return await profileService.createProfile(data)
    } catch (e: any) {
      console.error('[IPC] profile:create failed:', e.message)
      throw e
    }
  })

  ipcMain.handle('profile:update', async (_event, id: string, data: any) => {
    try {
      return await profileService.updateProfile(id, data)
    } catch (e: any) {
      console.error('[IPC] profile:update failed:', e.message)
      throw e
    }
  })

  ipcMain.handle('workspace:list', async (_event, profileId: string) => {
    try {
      return await profileService.listWorkspaces(profileId)
    } catch (e: any) {
      console.error('[IPC] workspace:list failed:', e.message)
      throw e
    }
  })

  ipcMain.handle('workspace:create', async (_event, data: any) => {
    try {
      return await profileService.createWorkspace(data)
    } catch (e: any) {
      console.error('[IPC] workspace:create failed:', e.message)
      throw e
    }
  })

  ipcMain.handle('workspace:switch', async (_event, id: string) => {
    try {
      await profileService.switchWorkspace(id)
    } catch (e: any) {
      console.error('[IPC] workspace:switch failed:', e.message)
      throw e
    }
  })

  ipcMain.handle('workspace:get-active', async () => {
    try {
      return profileService.getActiveWorkspace()
    } catch (e: any) {
      console.error('[IPC] workspace:get-active failed:', e.message)
      throw e
    }
  })
}
