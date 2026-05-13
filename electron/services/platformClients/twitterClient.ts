// Twitter / X API v2 client — stub, implement in Phase 2
export class TwitterClient {
  constructor(_accessToken: string) {}

  async postTweet(_text: string): Promise<{ id: string }> {
    throw new Error('Not implemented — wire up Twitter API v2')
  }

  async getTweetMetrics(_tweetId: string): Promise<Record<string, number>> {
    throw new Error('Not implemented')
  }

  async getUserProfile(): Promise<{ id: string; username: string; followersCount: number }> {
    throw new Error('Not implemented')
  }
}
