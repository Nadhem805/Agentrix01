import type { IpcMain } from 'electron'

// Handles: agent:run, agent:runs, agent:run-get
// Streams chunks back via: win.webContents.send('agent:stream', chunk)
export function registerAgentHandlers(_ipcMain: IpcMain) {
  // TODO: implement in Phase 3
  // ipcMain.handle('agent:run', async (event, {type, input}) => {
  //   const ollama = getOllamaClient()
  //   const prompt = buildPrompt(type, input)
  //   for await (const chunk of ollama.generate({model, prompt, stream: true})) {
  //     event.sender.send('agent:stream', chunk)
  //   }
  // })
}
