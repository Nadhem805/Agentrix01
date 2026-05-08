import { create } from 'zustand'
import type { Competitor, CompetitorPost } from '@/types/competitor'
import type { SocialPlatform } from '@/types/post'

interface CompetitorStore {
  competitors: Competitor[]
  competitorPosts: Record<string, CompetitorPost[]>
  isLoading: boolean
  isSyncing: string | null
  fetchCompetitors: (workspaceId: string) => Promise<void>
  addCompetitor: (workspaceId: string, platform: SocialPlatform, username: string) => Promise<Competitor>
  removeCompetitor: (id: string) => Promise<void>
  syncCompetitor: (id: string) => Promise<void>
  getCompetitorPosts: (competitorId: string) => Promise<void>
}

export const useCompetitorStore = create<CompetitorStore>((set) => ({
  competitors: [],
  competitorPosts: {},
  isLoading: false,
  isSyncing: null,

  fetchCompetitors: async (_workspaceId: string) => {
    set({ isLoading: true })
    try {
      // TODO: ipc.invoke('competitor:list', {workspaceId})
    } finally {
      set({ isLoading: false })
    }
  },

  addCompetitor: async (_workspaceId: string, _platform: SocialPlatform, _username: string) => {
    // TODO: ipc.invoke('competitor:add', {workspaceId, platform, username})
    throw new Error('Not implemented')
  },

  removeCompetitor: async (_id: string) => {
    // TODO: ipc.invoke('competitor:remove', {id})
  },

  syncCompetitor: async (id: string) => {
    set({ isSyncing: id })
    try {
      // TODO: ipc.invoke('competitor:sync', {id})
    } finally {
      set({ isSyncing: null })
    }
  },

  getCompetitorPosts: async (_competitorId: string) => {
    // TODO: ipc.invoke('competitor:posts', {competitorId})
  },
}))
