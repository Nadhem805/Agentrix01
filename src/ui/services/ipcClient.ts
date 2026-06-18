// IPC client — renderer-side wrapper for all Electron main process calls
// All communication goes through contextBridge (no direct Node.js access)

type IpcInvoke = (channel: string, ...args: unknown[]) => Promise<unknown>
type IpcOn = (channel: string, listener: (...args: unknown[]) => void) => void
type IpcOff = (channel: string, listener: (...args: unknown[]) => void) => void

// Access the contextBridge-exposed ipcRenderer
const ipc = window.ipcRenderer as {
  invoke: IpcInvoke
  on: IpcOn
  off: IpcOff
  send: (channel: string, ...args: unknown[]) => void
}

// ─── Profile ──────────────────────────────────────────────────────────────────
export const profileIpc = {
  getActive: () => ipc.invoke('profile:get-active'),
  create: (data: unknown) => ipc.invoke('profile:create', data),
  update: (id: string, data: unknown) => ipc.invoke('profile:update', id, data),
  listWorkspaces: (profileId: string) => ipc.invoke('workspace:list', profileId),
  createWorkspace: (data: unknown) => ipc.invoke('workspace:create', data),
  switchWorkspace: (id: string) => ipc.invoke('workspace:switch', id),
  getActiveWorkspace: () => ipc.invoke('workspace:get-active'),
}

// ─── Agents ───────────────────────────────────────────────────────────────────
export const agentIpc = {
  run: (type: string, input: unknown) => ipc.invoke('agent:run', { type, input }),
  getRuns: (workspaceId: string) => ipc.invoke('agent:runs', { workspaceId }),
  onStream: (listener: (chunk: string) => void) => {
    const handler = (_: unknown, chunk: string) => listener(chunk)
    ipc.on('agent:stream', handler as (...args: unknown[]) => void)
    return () => ipc.off('agent:stream', handler as (...args: unknown[]) => void)
  },
}

// ─── Ollama ───────────────────────────────────────────────────────────────────
export const ollamaIpc = {
  health: () => ipc.invoke('ollama:health'),
  models: () => ipc.invoke('ollama:models'),
  pull: (modelName: string) => ipc.invoke('ollama:pull', { modelName }),
  getConfig: () => ipc.invoke('ollama:config-get'),
  setConfig: (config: unknown) => ipc.invoke('ollama:config-set', config),
}

// ─── Posts ────────────────────────────────────────────────────────────────────
export const postIpc = {
  create: (data: unknown) => ipc.invoke('post:create', data),
  update: (id: string, data: unknown) => ipc.invoke('post:update', { id, data }),
  delete: (id: string) => ipc.invoke('post:delete', { id }),
  list: (workspaceId: string, filters?: unknown) => ipc.invoke('post:list', { workspaceId, filters }),
  schedule: (postId: string, scheduledAt: string, platforms: string[]) =>
    ipc.invoke('post:schedule', { postId, scheduledAt, platforms }),
  reschedule: (postId: string, scheduledAt: string) =>
    ipc.invoke('post:reschedule', { postId, scheduledAt }),
  cancel: (postId: string) => ipc.invoke('post:cancel', { postId }),
  getCalendar: (workspaceId: string, month: number, year: number) =>
    ipc.invoke('calendar:get', { workspaceId, month, year }),
}

// ─── Media ────────────────────────────────────────────────────────────────────
export const mediaIpc = {
  upload: (filePath: string, workspaceId: string) =>
    ipc.invoke('media:upload', { filePath, workspaceId }),
  delete: (mediaId: string) => ipc.invoke('media:delete', { mediaId }),
}

// ─── Competitors ──────────────────────────────────────────────────────────────
export const competitorIpc = {
  list: (workspaceId: string) => ipc.invoke('competitor:list', { workspaceId }),
  add: (workspaceId: string, platform: string, username: string) =>
    ipc.invoke('competitor:add', { workspaceId, platform, username }),
  remove: (id: string) => ipc.invoke('competitor:remove', { id }),
  sync: (id: string) => ipc.invoke('competitor:sync', { id }),
  posts: (competitorId: string) => ipc.invoke('competitor:posts', { competitorId }),
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsIpc = {
  overview: (workspaceId: string, from: string, to: string) =>
    ipc.invoke('analytics:overview', { workspaceId, from, to }),
  topPosts: (workspaceId: string, limit: number) =>
    ipc.invoke('analytics:top-posts', { workspaceId, limit }),
  sync: (workspaceId: string) => ipc.invoke('analytics:sync', { workspaceId }),
}
