// TikTok API client — stub, implement in Phase 2
export class TikTokClient {
  constructor(_accessToken: string) {}

  async uploadVideo(_videoPath: string, _caption: string): Promise<{ id: string }> {
    throw new Error('Not implemented — wire up TikTok API')
  }

  async getVideoInsights(_videoId: string): Promise<Record<string, number>> {
    throw new Error('Not implemented')
  }

  async getUserProfile(): Promise<{ id: string; username: string; followersCount: number }> {
    throw new Error('Not implemented')
  }
}
