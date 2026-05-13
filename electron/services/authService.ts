import { shell } from 'electron'

export type SocialPlatform = 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'linkedin'

/**
 * OAuth config per platform.
 * Fill in clientId / redirectUri once you register your app on each platform.
 */
const oauthConfig: Record<SocialPlatform, { authUrl: string; scopes: string[] }> = {
  instagram: {
    authUrl: 'https://api.instagram.com/oauth/authorize',
    scopes:  ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights'],
  },
  tiktok: {
    authUrl: 'https://www.tiktok.com/auth/authorize/',
    scopes:  ['user.info.basic', 'video.upload', 'video.list'],
  },
  twitter: {
    authUrl: 'https://twitter.com/i/oauth2/authorize',
    scopes:  ['tweet.read', 'tweet.write', 'users.read', 'offline.access'],
  },
  youtube: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    scopes:  ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly'],
  },
  linkedin: {
    authUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    scopes:  ['r_liteprofile', 'w_member_social', 'r_organization_social'],
  },
}

/**
 * Opens the platform OAuth URL in the user's default browser.
 * The app must register a custom protocol (e.g. agentrix://) to receive the callback.
 */
export async function initiateOAuth(platform: SocialPlatform, clientId: string, redirectUri: string): Promise<void> {
  const cfg    = oauthConfig[platform]
  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         cfg.scopes.join(' '),
  })
  await shell.openExternal(`${cfg.authUrl}?${params.toString()}`)
}
