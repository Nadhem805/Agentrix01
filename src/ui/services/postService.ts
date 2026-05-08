// Post / Content Studio API service — wired up in Phase 4
import type { Post, CreatePostData, MediaAsset } from '@/types/post'

export const postService = {
  createDraft: async (_data: CreatePostData): Promise<Post> => {
    // TODO: POST /posts
    throw new Error('Not implemented')
  },

  updateDraft: async (_id: string, _data: Partial<CreatePostData>): Promise<Post> => {
    // TODO: PATCH /posts/:id
    throw new Error('Not implemented')
  },

  deleteDraft: async (_id: string): Promise<void> => {
    // TODO: DELETE /posts/:id
  },

  uploadMedia: async (_file: File, _workspaceId: string): Promise<MediaAsset> => {
    // TODO: POST /media/upload (presigned URL flow) in Phase 4
    throw new Error('Not implemented')
  },

  listDrafts: async (_workspaceId: string): Promise<Post[]> => {
    // TODO: GET /posts?status=draft
    throw new Error('Not implemented')
  },
}
