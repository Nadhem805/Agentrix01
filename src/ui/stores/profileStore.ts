// stores/profileStore.ts

import { create } from 'zustand'
import type { Profile, Workspace, CreateProfileData, CreateWorkspaceData } from '@/types/profile'
import { profileIpc } from '../services/ipcClient'

interface ProfileStore {
  profile: Profile | null
  workspaces: Workspace[]
  activeWorkspace: Workspace | null
  isLoading: boolean
  checkProfile: () => Promise<boolean>
  createProfile: (data: CreateProfileData & { defaultWorkspaceName?: string }) => Promise<Profile>
  updateProfile: (id: string, data: Partial<CreateProfileData>) => Promise<Profile>
  fetchWorkspaces: () => Promise<void>
  setActiveWorkspace: (id: string) => Promise<void>
  createWorkspace: (data: CreateWorkspaceData) => Promise<Workspace>
}

export const useProfileStore = create<ProfileStore>((set, get) => ({
  profile: null,
  workspaces: [],
  activeWorkspace: null,
  isLoading: false,

  checkProfile: async () => {
    set({ isLoading: true })
    try {
      const active = await profileIpc.getActive() as Profile | null
      const activeWs = await profileIpc.getActiveWorkspace() as Workspace | null
      if (active) {
        set({ profile: active, activeWorkspace: activeWs })
        // Fetch workspaces immediately for this profile
        const wsList = await profileIpc.listWorkspaces(active.id) as Workspace[]
        set({ workspaces: wsList })
        return true
      }
      return false
    } catch (e) {
      console.error('Failed to check active profile:', e)
      return false
    } finally {
      set({ isLoading: false })
    }
  },

  createProfile: async (data: CreateProfileData & { defaultWorkspaceName?: string }) => {
    set({ isLoading: true })
    try {
      const created = await profileIpc.create(data) as Profile
      set({ profile: created })
      
      // Auto-load profile & active workspace
      const activeWs = await profileIpc.getActiveWorkspace() as Workspace | null
      set({ activeWorkspace: activeWs })

      const wsList = await profileIpc.listWorkspaces(created.id) as Workspace[]
      set({ workspaces: wsList })

      return created
    } catch (error) {
      console.error('Failed to create profile:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  updateProfile: async (id: string, data: Partial<CreateProfileData>) => {
    set({ isLoading: true })
    try {
      const updated = await profileIpc.update(id, data) as Profile
      set({ profile: updated })
      return updated
    } catch (error) {
      console.error('Failed to update profile:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  fetchWorkspaces: async () => {
    const prof = get().profile
    if (!prof) return
    set({ isLoading: true })
    try {
      const wsList = await profileIpc.listWorkspaces(prof.id) as Workspace[]
      set({ workspaces: wsList })
    } catch (error) {
      console.error('Failed to fetch workspaces:', error)
    } finally {
      set({ isLoading: false })
    }
  },

  setActiveWorkspace: async (id: string) => {
    set({ isLoading: true })
    try {
      await profileIpc.switchWorkspace(id)
      const activeWs = await profileIpc.getActiveWorkspace() as Workspace | null
      set({ activeWorkspace: activeWs })
    } catch (error) {
      console.error('Failed to set active workspace:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  createWorkspace: async (data: CreateWorkspaceData) => {
    set({ isLoading: true })
    try {
      const created = await profileIpc.createWorkspace(data) as Workspace
      set({ activeWorkspace: created })
      
      const profileId = get().profile?.id
      if (profileId) {
        const wsList = await profileIpc.listWorkspaces(profileId) as Workspace[]
        set({ workspaces: wsList })
      }
      return created
    } catch (error) {
      console.error('Failed to create workspace:', error)
      throw error
    } finally {
      set({ isLoading: false })
    }
  },
}))