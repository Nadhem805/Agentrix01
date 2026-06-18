import { shell } from 'electron'
import { createRequire } from 'node:module'
import { randomUUID } from 'node:crypto'
import { encrypt } from './encryption'
import { getDatabase } from './database'

const require = createRequire(import.meta.url)
const https   = require('node:https')

// ─── Config ───────────────────────────────────────────────────────────────────

export function getInstagramConfig() {
  return {
    clientId:      process.env.INSTAGRAM_CLIENT_ID     ?? '',
    clientSecret:  process.env.INSTAGRAM_CLIENT_SECRET ?? '',
    redirectUri:   process.env.INSTAGRAM_REDIRECT_URI  ?? 'https://localhost/oauth/instagram',
    encryptionKey: process.env.TOKEN_ENCRYPTION_KEY    ?? 'fallback-dev-key-change-in-prod',
  }
}

// ─── Step 1 — Open Instagram login in browser ─────────────────────────────────

export async function startInstagramOAuth(): Promise<void> {
  const { clientId, redirectUri } = getInstagramConfig()

  if (!clientId) throw new Error('INSTAGRAM_CLIENT_ID is not set in .env')

  const scopes = [
    'instagram_business_basic',
    'instagram_business_content_publish',
    'instagram_business_manage_comments',
    'instagram_business_manage_insights',
  ].join(',')

  const params = new URLSearchParams({
    force_reauth:  'true',
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         scopes,
  })

  const authUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`
  console.log('[Instagram OAuth] Opening:', authUrl)
  await shell.openExternal(authUrl)
}

// ─── Step 2 — Exchange code for access token ──────────────────────────────────

interface TokenResponse {
  access_token: string
  token_type:   string
}

export async function exchangeCodeForToken(code: string): Promise<TokenResponse> {
  const { clientId, clientSecret, redirectUri } = getInstagramConfig()

  // Strip any fragment (#_) that Instagram sometimes appends
  const cleanCode = code.split('#')[0].trim()

  console.log('[Instagram OAuth] Exchanging code:', cleanCode.substring(0, 20) + '...')
  console.log('[Instagram OAuth] redirect_uri used:', redirectUri)
  console.log('[Instagram OAuth] client_id used:', clientId)

  const body = new URLSearchParams({
    client_id:     clientId,
    client_secret: clientSecret,
    grant_type:    'authorization_code',
    redirect_uri:  redirectUri,
    code:          cleanCode,
  }).toString()

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.instagram.com',
        path:     '/oauth/access_token',
        method:   'POST',
        headers:  {
          'Content-Type':   'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res: any) => {
        let data = ''
        res.on('data', (chunk: string) => (data += chunk))
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data)
            console.log('[Instagram OAuth] Token response:', parsed)
            if (parsed.error_message || parsed.error_type) {
              reject(new Error(parsed.error_message ?? parsed.error_type))
            } else {
              resolve(parsed as TokenResponse)
            }
          } catch {
            reject(new Error('Failed to parse token response'))
          }
        })
      }
    )
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ─── Step 3 — Fetch Instagram user profile ────────────────────────────────────

interface InstagramProfile {
  id:                   string
  username:             string
  name?:                string
  profile_picture_url?: string
}

export async function fetchInstagramProfile(accessToken: string): Promise<InstagramProfile> {
  const fields = 'id,username,name,profile_picture_url'
  const url    = `https://graph.instagram.com/me?fields=${fields}&access_token=${accessToken}`

  return new Promise((resolve, reject) => {
    https.get(url, (res: any) => {
      let data = ''
      res.on('data', (chunk: string) => (data += chunk))
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          console.log('[Instagram OAuth] Profile response:', parsed)
          if (parsed.error) {
            reject(new Error(parsed.error.message))
          } else {
            resolve(parsed as InstagramProfile)
          }
        } catch {
          reject(new Error('Failed to parse profile response'))
        }
      })
    }).on('error', reject)
  })
}

// ─── Step 4 — Save encrypted token to SQLite ─────────────────────────────────

export function saveInstagramAccount(
  workspaceId: string,
  profile: InstagramProfile,
  accessToken: string
): void {
  const { encryptionKey } = getInstagramConfig()
  const db = getDatabase()

  // Ensure a default profile + workspace exist (for dev/demo mode)
  const profileExists = db.prepare('SELECT id FROM profiles WHERE id = ?').get('default-profile')
  if (!profileExists) {
    db.prepare(`INSERT OR IGNORE INTO profiles (id, name, created_at, updated_at)
      VALUES ('default-profile', 'Default User', datetime('now'), datetime('now'))`).run()
  }
  const workspaceExists = db.prepare('SELECT id FROM workspaces WHERE id = ?').get(workspaceId)
  if (!workspaceExists) {
    db.prepare(`INSERT OR IGNORE INTO workspaces (id, profile_id, name, timezone, default_language, created_at, updated_at)
      VALUES (?, 'default-profile', 'My Workspace', 'UTC', 'en', datetime('now'), datetime('now'))`).run(workspaceId)
  }

  const encryptedToken = encrypt(accessToken, encryptionKey)
  const existing = db.prepare('SELECT id FROM social_accounts WHERE workspace_id = ? AND platform = ? AND platform_user_id = ?')
    .get(workspaceId, 'instagram', profile.id)

  if (existing) {
    db.prepare(`
      UPDATE social_accounts
      SET access_token = ?, platform_username = ?, platform_display_name = ?,
          avatar_url = ?, is_active = 1, updated_at = datetime('now')
      WHERE workspace_id = ? AND platform = ? AND platform_user_id = ?
    `).run(encryptedToken, profile.username, profile.name ?? profile.username, profile.profile_picture_url ?? null, workspaceId, 'instagram', profile.id)
    console.log('[Instagram OAuth] Updated existing account:', profile.username)
  } else {
    db.prepare(`
      INSERT INTO social_accounts
        (id, workspace_id, platform, platform_user_id, platform_username,
         platform_display_name, avatar_url, access_token, scopes, is_active, connected_at, updated_at)
      VALUES (?, ?, 'instagram', ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `).run(
      randomUUID(),
      workspaceId,
      profile.id,
      profile.username,
      profile.name ?? profile.username,
      profile.profile_picture_url ?? null,
      encryptedToken,
      JSON.stringify([
        'instagram_business_basic',
        'instagram_business_content_publish',
        'instagram_business_manage_comments',
        'instagram_business_manage_insights',
      ])
    )
    console.log('[Instagram OAuth] Saved new account:', profile.username)
  }
}

// ─── No-op export kept for main.ts compatibility ─────────────────────────────
export function registerOAuthProtocolHandler(): void {
  // Protocol interception not used — manual code paste flow instead
}
