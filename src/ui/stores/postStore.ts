import { create } from 'zustand'
import type { Post, CreatePostData } from '@/types/post'

interface PostStore {
  drafts: Post[]
  scheduledPosts: Post[]
  isLoading: boolean
  fetchDrafts: (workspaceId: string) => Promise<void>
  createDraft: (data: CreatePostData) => Promise<Post>
  updateDraft: (id: string, data: Partial<CreatePostData>) => Promise<Post>
  deleteDraft: (id: string) => Promise<void>
}

export const usePostStore = create<PostStore>((set) => ({
  drafts: [],
  scheduledPosts: [],
  isLoading: false,

  fetchDrafts: async (_workspaceId: string) => {
    set({ isLoading: true })
    try {
      // TODO: GET /posts?status=draft in Phase 4
    } finally {
      set({ isLoading: false })
    }
  },

  createDraft: async (_data: CreatePostData) => {
    // TODO: POST /posts in Phase 4
    throw new Error('Not implemented')
  },

  updateDraft: async (_id: string, _data: Partial<CreatePostData>) => {
    // TODO: PATCH /posts/:id in Phase 4
    throw new Error('Not implemented')
  },

  deleteDraft: async (_id: string) => {
    // TODO: DELETE /posts/:id in Phase 4
  },
}))
