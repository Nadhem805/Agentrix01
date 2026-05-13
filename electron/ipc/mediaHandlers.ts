import { ipcMain } from 'electron'
import { saveMediaFile, deleteMediaFile, getFileMetadata } from '../services/mediaService'

export function registerMediaHandlers(): void {
  ipcMain.handle('media:save', async (_event, workspaceId: string, sourcePath: string) => {
    const dest = saveMediaFile(workspaceId, sourcePath)
    const meta = getFileMetadata(dest)
    return { localPath: dest, ...meta }
  })

  ipcMain.handle('media:delete', async (_event, filePath: string) => {
    deleteMediaFile(filePath)
    return { success: true }
  })

  ipcMain.handle('media:metadata', async (_event, filePath: string) => {
    return getFileMetadata(filePath)
  })
}
