import type { IpcMain } from 'electron'

// Handles: ollama:health, ollama:models, ollama:pull, ollama:config-get, ollama:config-set
export function registerOllamaHandlers(_ipcMain: IpcMain) {
  // TODO: implement in Phase 3
  // ipcMain.handle('ollama:health', async () => {
  //   const res = await fetch('http://localhost:11434/api/tags')
  //   return { isRunning: res.ok, availableModels: [...] }
  // })
}
