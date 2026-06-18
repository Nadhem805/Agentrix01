// stores/competitorStore.ts

import { create } from 'zustand'
import type { Competitor, CompetitorPost } from '@/types/competitor'
import type { SocialPlatform } from '@/types/post'
import { competitorIpc } from '../services/ipcClient'

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

export const useCompetitorStore = create<CompetitorStore>((set, get) => ({
  competitors: [],
  competitorPosts: {},
  isLoading: false,
  isSyncing: null,

  fetchCompetitors: async (workspaceId: string) => {
    set({ isLoading: true })
    try {
      const list = await competitorIpc.list(workspaceId) as Competitor[]
      set({ competitors: list })
    } catch (e) {
      console.error('Failed to fetch competitors:', e)
    } finally {
      set({ isLoading: false })
    }
  },

  addCompetitor: async (workspaceId: string, platform: SocialPlatform, username: string) => {
    set({ isLoading: true })
    try {
      const created = await competitorIpc.add(workspaceId, platform, username) as Competitor
      set((state) => ({
        competitors: [created, ...state.competitors.filter((c) => c.id !== created.id)],
      }))
      return created
    } catch (e) {
      console.error('Failed to add competitor:', e)
      throw e
    } finally {
      set({ isLoading: false })
    }
  },

  removeCompetitor: async (id: string) => {
    set({ isLoading: true })
    try {
      await competitorIpc.remove(id)
      set((state) => ({
        competitors: state.competitors.filter((c) => c.id !== id),
      }))
      
      const newPosts = { ...get().competitorPosts }
      delete newPosts[id]
      set({ competitorPosts: newPosts })
    } catch (e) {
      console.error('Failed to remove competitor:', e)
    } finally {
      set({ isLoading: false })
    }
  },

  syncCompetitor: async (id: string) => {
    set({ isSyncing: id })
    try {
      await competitorIpc.sync(id)
      
      // Fetch latest posts for this competitor
      const posts = await competitorIpc.posts(id) as CompetitorPost[]
      set((state) => ({
        competitorPosts: {
          ...state.competitorPosts,
          [id]: posts,
        },
      }))

      // Refresh competitors list to update metrics and lastSyncedAt
      const competitor = get().competitors.find(c => c.id === id)
      if (competitor) {
        const list = await competitorIpc.list(competitor.workspaceId) as Competitor[]
        set({ competitors: list })
      }
    } catch (e) {
      console.error('Failed to sync competitor:', e)
      throw e
    } finally {
      set({ isSyncing: null })
    }
  },

  getCompetitorPosts: async (competitorId: string) => {
    try {
      const posts = await competitorIpc.posts(competitorId) as CompetitorPost[]
      set((state) => ({
        competitorPosts: {
          ...state.competitorPosts,
          [competitorId]: posts,
        },
      }))
    } catch (e) {
      console.error('Failed to get competitor posts:', e)
    }
  },
}))