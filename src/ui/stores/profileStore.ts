import { create } from 'zustand'
import type { Profile, Workspace, CreateProfileData, CreateWorkspaceData } from '@/types/profile'

interface ProfileStore {
  profile: Profile | null
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  isLoading: boolean
  checkProfile: () => Promise<boolean>
  createProfile: (data: CreateProfileData) => Promise<Profile>
  fetchWorkspaces: () => Promise<void>
  setActiveWorkspace: (id: string) => void
  createWorkspace: (data: CreateWorkspaceData) => Promise<Workspace>
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,

  checkProfile: async () => {
    // TODO: ipc.invoke('profile:check') in Phase 2
    return false
  },

  createProfile: async (_data: CreateProfileData) => {
    // TODO: ipc.invoke('profile:create', data) in Phase 2
    throw new Error('Not implemented')
  },

  fetchWorkspaces: async () => {
    set({ isLoading: true })
    try {
      // TODO: ipc.invoke('workspace:list') in Phase 2
    } finally {
      set({ isLoading: false })
    }
  },

  setActiveWorkspace: (id) => {
    const workspace = get().workspaces.find((w) => w.id === id) ?? null
    set({ activeWorkspace: workspace })
    // TODO: persist to electron-store
  },

  createWorkspace: async (_data: CreateWorkspaceData) => {
    // TODO: ipc.invoke('workspace:create', data) in Phase 2
    throw new Error('Not implemented')
  },
}))
