// Instagram Graph API client — stub, implement in Phase 2
export class InstagramClient {
  constructor(_accessToken: string) {}

  async publishPost(_mediaUrl: string, _caption: string): Promise<{ id: string; permalink: string }> {
    throw new Error('Not implemented — wire up Instagram Graph API')
  }

  async getInsights(_postId: string): Promise<Record<string, number>> {
    throw new Error('Not implemented')
  }

  async getUserProfile(): Promise<{ id: string; username: string; followersCount: number }> {
    throw new Error('Not implemented')
  }
}
