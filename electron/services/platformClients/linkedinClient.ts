// LinkedIn API v2 client — stub, implement in Phase 2
export class LinkedInClient {
  constructor(_accessToken: string) {}

  async publishPost(_text: string, _mediaUrl?: string): Promise<{ id: string }> {
    throw new Error('Not implemented — wire up LinkedIn API v2')
  }

  async getPostMetrics(_postId: string): Promise<Record<string, number>> {
    throw new Error('Not implemented')
  }

  async getUserProfile(): Promise<{ id: string; name: string; followersCount: number }> {
    throw new Error('Not implemented')
  }
}
