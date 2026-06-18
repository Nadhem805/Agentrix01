import { shell } from 'electron'
import { createRequire } from 'node:module'
import { randomUUID, randomBytes } from 'node:crypto'
import { encrypt } from './encryption'
import { getDatabase } from './database'

const require = createRequire(import.meta.url)
const https      = require('node:https')
const url_mod    = require('node:url')
const selfsigned = require('selfsigned')

// ─── Config ───────────────────────────────────────────────────────────────────

export function getYouTubeConfig() {
  return {
    clientId:      process.env.YOUTUBE_CLIENT_ID     ?? '',
    clientSecret:  process.env.YOUTUBE_CLIENT_SECRET ?? '',
    redirectUri:   process.env.YOUTUBE_REDIRECT_URI  ?? 'https://localhost:8765/oauth/youtube',
    encryptionKey: process.env.TOKEN_ENCRYPTION_KEY  ?? 'fallback-dev-key-change-in-prod',
  }
}

// ─── Step 1 — Open YouTube login in browser ────────────────────────────────────

export async function startYouTubeOAuth(): Promise<void> {
  const { clientId, redirectUri } = getYouTubeConfig()

  if (!clientId) throw new Error('YOUTUBE_CLIENT_ID is not set in .env')
    
  const state = randomBytes(16).toString('hex')

  // YouTube Data API scopes
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly'
  ].join(' ')

  const params = new URLSearchParams({
    client_id:             clientId,
    redirect_uri:          redirectUri,
    response_type:         'code',
    scope:                 scopes,
    state,
    access_type:           'offline', // Needed to get a refresh token
    prompt:                'consent'  // Force consent screen to guarantee refresh token
  })

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  console.log('[YouTube OAuth] Opening:', authUrl)
  await shell.openExternal(authUrl)
}

// ─── Step 2 — HTTPS server to catch the redirect ─────────────────────────────

export function setupYouTubeCallbackServer(
  onCode: (code: string) => void,
  onError: (err: string) => void
): () => void {
  const { redirectUri } = getYouTubeConfig()
  const port = parseInt(new URL(redirectUri).port || '8765')

  // Generate self-signed cert for localhost
  const attrs = [{ name: 'commonName', value: 'localhost' }]
  const pems   = selfsigned.generate(attrs, { days: 1 })

  const server = https.createServer(
    { key: pems.private, cert: pems.cert },
    (req: any, res: any) => {
      try {
        const parsed = url_mod.parse(req.url, true)

        if (!req.url.startsWith('/oauth/youtube')) {
          res.writeHead(404); res.end(); return
        }

        const code  = parsed.query.code as string | undefined
        const error = parsed.query.error as string | undefined

        if (error) {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end('<html><body><h2>YouTube connection failed. You can close this tab.</h2></body></html>')
          onError(parsed.query.error_description as string ?? error)
          server.close()
          return
        }

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(`
            <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0E0E12;color:#F5F5F7">
              <h2 style="color:#FF0000">&#10003; YouTube Connected!</h2>
              <p>You can close this tab and return to Agentrix.</p>
            </body></html>
          `)
          onCode(code)
          server.close()
          return
        }
      } catch { /* ignore */ }
      res.writeHead(404); res.end()
    }
  )

  server.listen(port, '127.0.0.1', () => {
    console.log(`[YouTube OAuth] HTTPS server listening on https://localhost:${port}`)
  })

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      onError(`Port ${port} is already in use. Close other apps and try again.`)
    } else {
      onError(`Server error: ${err.message}`)
    }
  })

  return () => { try { server.close() } catch {} }
}

// ─── Step 3 — Exchange code for access token ──────────────────────────────────

export interface YouTubeTokenResponse {
  access_token:  string
  refresh_token: string
  expires_in:    number
  scope:         string
  token_type:    string
}

export async function exchangeYouTubeCode(code: string): Promise<YouTubeTokenResponse> {
  const { clientId, clientSecret, redirectUri } = getYouTubeConfig()

  const body = new URLSearchParams({
    client_id:     clientId,
    client_secret: clientSecret,
    code,
    grant_type:    'authorization_code',
    redirect_uri:  redirectUri,
  }).toString()

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'oauth2.googleapis.com',
        path:     '/token',
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
            if (parsed.error) {
              reject(new Error(parsed.error_description ?? parsed.error))
            } else {
              resolve(parsed as YouTubeTokenResponse)
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

// ─── Step 4 — Fetch YouTube Channel profile ───────────────────────────────────────

export interface YouTubeProfile {
  id:           string
  display_name: string
  avatar_url?:  string
}

export async function fetchYouTubeProfile(accessToken: string): Promise<YouTubeProfile> {
  const url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&mine=true`

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method:  'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    }, (res: any) => {
      let data = ''
      res.on('data', (chunk: string) => (data += chunk))
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.error) {
            reject(new Error(parsed.error.message ?? 'Profile fetch failed'))
          } else if (parsed.items && parsed.items.length > 0) {
            const channel = parsed.items[0]
            resolve({
              id: channel.id,
              display_name: channel.snippet.title,
              avatar_url: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.medium?.url || channel.snippet.thumbnails?.default?.url
            })
          } else {
             reject(new Error('No YouTube channel found for this user'))
          }
        } catch {
          reject(new Error('Failed to parse profile response'))
        }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

// ─── Step 5 — Save encrypted token to SQLite ─────────────────────────────────

export function saveYouTubeAccount(
  workspaceId: string,
  profile: YouTubeProfile,
  tokenRes: YouTubeTokenResponse
): void {
  const { encryptionKey } = getYouTubeConfig()
  const db = getDatabase()

  // Ensure default profile + workspace exist
  db.prepare(`INSERT OR IGNORE INTO profiles (id, name, created_at, updated_at)
    VALUES ('default-profile', 'Default User', datetime('now'), datetime('now'))`).run()
  db.prepare(`INSERT OR IGNORE INTO workspaces (id, profile_id, name, timezone, default_language, created_at, updated_at)
    VALUES (?, 'default-profile', 'My Workspace', 'UTC', 'en', datetime('now'), datetime('now'))`).run(workspaceId)

  const encryptedAccess  = encrypt(tokenRes.access_token,  encryptionKey)
  const encryptedRefresh = tokenRes.refresh_token ? encrypt(tokenRes.refresh_token, encryptionKey) : null
  const expiresAt        = new Date(Date.now() + tokenRes.expires_in * 1000).toISOString()

  const existing = db.prepare(
    'SELECT id, refresh_token FROM social_accounts WHERE workspace_id = ? AND platform = ? AND platform_user_id = ?'
  ).get(workspaceId, 'youtube', profile.id) as { id: string, refresh_token: string | null } | undefined

  if (existing) {
    // If google doesn't return a new refresh token, keep the old one
    const newRefreshToSave = encryptedRefresh || existing.refresh_token

    db.prepare(`
      UPDATE social_accounts
      SET access_token = ?, refresh_token = ?, token_expires_at = ?,
          platform_display_name = ?, avatar_url = ?, is_active = 1, updated_at = datetime('now')
      WHERE workspace_id = ? AND platform = ? AND platform_user_id = ?
    `).run(encryptedAccess, newRefreshToSave, expiresAt,
           profile.display_name, profile.avatar_url ?? null, workspaceId, 'youtube', profile.id)
    console.log('[YouTube OAuth] Updated existing account:', profile.display_name)
  } else {
    db.prepare(`
      INSERT INTO social_accounts
        (id, workspace_id, platform, platform_user_id, platform_username,
         platform_display_name, avatar_url, access_token, refresh_token,
         token_expires_at, scopes, is_active, connected_at, updated_at)
      VALUES (?, ?, 'youtube', ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `).run(
      randomUUID(), workspaceId,
      profile.id,
      profile.display_name,
      profile.display_name,
      profile.avatar_url ?? null,
      encryptedAccess,
      encryptedRefresh,
      expiresAt,
      JSON.stringify([tokenRes.scope])
    )
    console.log('[YouTube OAuth] Saved new account:', profile.display_name)
  }
}
