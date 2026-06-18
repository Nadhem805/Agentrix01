import { shell } from 'electron'
import { createRequire } from 'node:module'
import { randomUUID, randomBytes, createHash } from 'node:crypto'
import { encrypt } from './encryption'
import { getDatabase } from './database'

const require = createRequire(import.meta.url)
const https      = require('node:https')
const url_mod    = require('node:url')
const selfsigned = require('selfsigned')

// ─── Config ───────────────────────────────────────────────────────────────────

export function getTikTokConfig() {
  return {
    clientKey:     process.env.TIKTOK_CLIENT_KEY     ?? '',
    clientSecret:  process.env.TIKTOK_CLIENT_SECRET  ?? '',
    redirectUri:   process.env.TIKTOK_REDIRECT_URI   ?? 'https://localhost:8765/oauth/tiktok',
    encryptionKey: process.env.TOKEN_ENCRYPTION_KEY  ?? 'fallback-dev-key-change-in-prod',
  }
}

// ─── Step 1 — Open TikTok login in browser ────────────────────────────────────

export async function startTikTokOAuth(): Promise<string> {
  const { clientKey, redirectUri } = getTikTokConfig()

  if (!clientKey) throw new Error('TIKTOK_CLIENT_KEY is not set in .env')

  // PKCE: generate strict alphanumeric code verifier (length 64)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let codeVerifier = ''
  for (let i = 0; i < 64; i++) {
    codeVerifier += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  // TikTok API bug: despite documentation saying Base64URL, it actually expects Hex encoding for the challenge
  const codeChallenge = createHash('sha256')
    .update(codeVerifier)
    .digest('hex')
    
  const state = randomBytes(16).toString('hex')

  const scopes = 'user.info.basic,user.info.stats,video.list'

  const params = new URLSearchParams({
    client_key:            clientKey,
    redirect_uri:          redirectUri,
    response_type:         'code',
    scope:                 scopes,
    state,
    code_challenge:        codeChallenge,
    code_challenge_method: 'S256',
  })

  const authUrl = `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`
  console.log('[TikTok OAuth] Opening:', authUrl)
  await shell.openExternal(authUrl)

  return codeVerifier
}

// ─── Step 2 — HTTPS server to catch the redirect ─────────────────────────────

export function setupTikTokCallbackServer(
  _codeVerifier: string,
  onCode: (code: string) => void,
  onError: (err: string) => void
): () => void {
  const { redirectUri } = getTikTokConfig()
  const port = parseInt(new URL(redirectUri).port || '8765')

  // Generate self-signed cert for localhost
  const attrs = [{ name: 'commonName', value: 'localhost' }]
  const pems   = selfsigned.generate(attrs, { days: 1 })

  const server = https.createServer(
    { key: pems.private, cert: pems.cert },
    (req: any, res: any) => {
      try {
        const parsed = url_mod.parse(req.url, true)

        if (!req.url.startsWith('/oauth/tiktok')) {
          res.writeHead(404); res.end(); return
        }

        const code  = parsed.query.code as string | undefined
        const error = parsed.query.error as string | undefined

        if (error) {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end('<html><body><h2>TikTok connection failed. You can close this tab.</h2></body></html>')
          onError(parsed.query.error_description as string ?? error)
          server.close()
          return
        }

        if (code) {
          res.writeHead(200, { 'Content-Type': 'text/html' })
          res.end(`
            <html><body style="font-family:sans-serif;text-align:center;padding:60px;background:#0E0E12;color:#F5F5F7">
              <h2 style="color:#69C9D0">&#10003; TikTok Connected!</h2>
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
    console.log(`[TikTok OAuth] HTTPS server listening on https://localhost:${port}`)
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

interface TikTokTokenResponse {
  access_token:  string
  refresh_token: string
  open_id:       string
  scope:         string
  expires_in:    number
  token_type:    string
}

export async function exchangeTikTokCode(code: string, codeVerifier: string): Promise<TikTokTokenResponse> {
  const { clientKey, clientSecret, redirectUri } = getTikTokConfig()

  const body = new URLSearchParams({
    client_key:    clientKey,
    client_secret: clientSecret,
    code,
    grant_type:    'authorization_code',
    redirect_uri:  redirectUri,
    code_verifier: codeVerifier,
  }).toString()

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'open.tiktokapis.com',
        path:     '/v2/oauth/token/',
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
            console.log('[TikTok OAuth] Token response:', { ...parsed, access_token: '***', refresh_token: '***' })
            if (parsed.error) {
              reject(new Error(parsed.error_description ?? parsed.error))
            } else {
              resolve(parsed as TikTokTokenResponse)
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

// ─── Step 4 — Fetch TikTok user profile ───────────────────────────────────────

interface TikTokProfile {
  open_id:      string
  display_name: string
  avatar_url?:  string
}

export async function fetchTikTokProfile(accessToken: string): Promise<TikTokProfile> {
  const fields = 'open_id,display_name,avatar_url'
  const url    = `https://open.tiktokapis.com/v2/user/info/?fields=${fields}`

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
          console.log('[TikTok OAuth] Profile response:', parsed)
          if (parsed.error?.code && parsed.error.code !== 'ok') {
            reject(new Error(parsed.error.message ?? 'Profile fetch failed'))
          } else {
            resolve(parsed.data?.user as TikTokProfile)
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

export function saveTikTokAccount(
  workspaceId: string,
  profile: TikTokProfile,
  tokenRes: TikTokTokenResponse
): void {
  const { encryptionKey } = getTikTokConfig()
  const db = getDatabase()

  // Ensure default profile + workspace exist
  db.prepare(`INSERT OR IGNORE INTO profiles (id, name, created_at, updated_at)
    VALUES ('default-profile', 'Default User', datetime('now'), datetime('now'))`).run()
  db.prepare(`INSERT OR IGNORE INTO workspaces (id, profile_id, name, timezone, default_language, created_at, updated_at)
    VALUES (?, 'default-profile', 'My Workspace', 'UTC', 'en', datetime('now'), datetime('now'))`).run(workspaceId)

  const encryptedAccess  = encrypt(tokenRes.access_token,  encryptionKey)
  const encryptedRefresh = encrypt(tokenRes.refresh_token, encryptionKey)
  const expiresAt        = new Date(Date.now() + tokenRes.expires_in * 1000).toISOString()

  const existing = db.prepare(
    'SELECT id FROM social_accounts WHERE workspace_id = ? AND platform = ? AND platform_user_id = ?'
  ).get(workspaceId, 'tiktok', profile.open_id)

  if (existing) {
    db.prepare(`
      UPDATE social_accounts
      SET access_token = ?, refresh_token = ?, token_expires_at = ?,
          platform_display_name = ?, avatar_url = ?, is_active = 1, updated_at = datetime('now')
      WHERE workspace_id = ? AND platform = ? AND platform_user_id = ?
    `).run(encryptedAccess, encryptedRefresh, expiresAt,
           profile.display_name, profile.avatar_url ?? null, workspaceId, 'tiktok', profile.open_id)
    console.log('[TikTok OAuth] Updated existing account:', profile.display_name)
  } else {
    db.prepare(`
      INSERT INTO social_accounts
        (id, workspace_id, platform, platform_user_id, platform_username,
         platform_display_name, avatar_url, access_token, refresh_token,
         token_expires_at, scopes, is_active, connected_at, updated_at)
      VALUES (?, ?, 'tiktok', ?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `).run(
      randomUUID(), workspaceId,
      profile.open_id,
      profile.display_name,
      profile.display_name,
      profile.avatar_url ?? null,
      encryptedAccess,
      encryptedRefresh,
      expiresAt,
      JSON.stringify(['user.info.basic', 'user.info.stats', 'video.list'])
    )
    console.log('[TikTok OAuth] Saved new account:', profile.display_name)
  }
}
