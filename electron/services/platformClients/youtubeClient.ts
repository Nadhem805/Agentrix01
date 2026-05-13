// YouTube Data API v3 client — stub, implement in Phase 2
export class YouTubeClient {
  constructor(_accessToken: string) {}

  async uploadVideo(_videoPath: string, _title: string, _description: string): Promise<{ id: string }> {
    throw new Error('Not implemented — wire up YouTube Data API v3')
  }

  async getVideoAnalytics(_videoId: string): Promise<Record<string, number>> {
    throw new Error('Not implemented')
  }

  async getChannelProfile(): Promise<{ id: string; title: string; subscriberCount: number }> {
    throw new Error('Not implemented')
  }
}
