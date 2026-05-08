import { create } from 'zustand'
import type { Workspace, CreateWorkspaceData } from '@/types/workspace'

interface WorkspaceStore {
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  isLoading: boolean
  fetchWorkspaces: () => Promise<void>
  setActiveWorkspace: (id: string) => void
  createWorkspace: (data: CreateWorkspaceData) => Promise<Workspace>
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,

  fetchWorkspaces: async () => {
    set({ isLoading: true })
    try {
      // TODO: GET /workspaces in Phase 3
    } finally {
      set({ isLoading: false })
    }
  },

  setActiveWorkspace: (id) => {
    const workspace = get().workspaces.find((w) => w.id === id) ?? null
    set({ activeWorkspace: workspace })
    // TODO: persist to electron-store in Phase 3
  },

  createWorkspace: async (_data: CreateWorkspaceData) => {
    // TODO: POST /workspaces in Phase 3
    throw new Error('Not implemented')
  },
}))
