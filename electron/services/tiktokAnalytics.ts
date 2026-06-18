import { createRequire } from 'node:module'
import { getDatabase } from './database'
import { decrypt, encrypt } from './encryption'
import { getTikTokConfig } from './tiktokOAuth'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const https   = require('node:https')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function httpsPost(url: string, body: object, accessToken: string): Promise<any> {
  const urlObj = new URL(url)
  const data = JSON.stringify(body)

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: urlObj.hostname,
      path:     urlObj.pathname + urlObj.search,
      method:   'POST',
      headers:  {
        'Authorization':  `Bearer ${accessToken}`,
        'Content-Type':   'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res: any) => {
      let bodyData = ''
      res.on('data', (chunk: string) => (bodyData += chunk))
      res.on('end', () => {
        try { resolve(JSON.parse(bodyData)) }
        catch { reject(new Error('Failed to parse response')) }
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

function httpsGet(url: string, accessToken: string): Promise<any> {
  const urlObj = new URL(url)

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: urlObj.hostname,
      path:     urlObj.pathname + urlObj.search,
      method:   'GET',
      headers:  {
        'Authorization': `Bearer ${accessToken}`,
      },
    }, (res: any) => {
      let bodyData = ''
      res.on('data', (chunk: string) => (bodyData += chunk))
      res.on('end', () => {
        try { resolve(JSON.parse(bodyData)) }
        catch { reject(new Error('Failed to parse response')) }
      })
    })
    req.on('error', reject)
    req.end()
  })
}

// ─── Step 1 — Refresh Token (if expired) ──────────────────────────────────────

export async function refreshTikTokToken(refreshToken: string): Promise<{ access_token: string, refresh_token: string, expires_in: number }> {
  const { clientKey, clientSecret } = getTikTokConfig()
  
  const body = new URLSearchParams({
    client_key:    clientKey,
    client_secret: clientSecret,
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
  }).toString()

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'open.tiktokapis.com',
      path:     '/v2/oauth/token/',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res: any) => {
      let data = ''
      res.on('data', (chunk: string) => (data += chunk))
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          if (parsed.error) reject(new Error(parsed.error_description ?? parsed.error))
          else resolve(parsed)
        } catch { reject(new Error('Failed to parse token response')) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

// ─── Step 2 — Fetch account-level metrics ─────────────────────────────────────

export async function fetchTikTokAccountMetrics(accessToken: string): Promise<{
  followerCount:  number
  followingCount: number
  likesCount:     number
  videoCount:     number
}> {
  const fields = 'follower_count,following_count,likes_count,video_count'
  const url    = `https://open.tiktokapis.com/v2/user/info/?fields=${fields}`
  
  const res = await httpsGet(url, accessToken)
  if (res.error?.code && res.error.code !== 'ok') {
    throw new Error(res.error.message ?? 'Failed to fetch user info')
  }
  
  const user = res.data?.user ?? {}
  return {
    followerCount:  user.follower_count ?? 0,
    followingCount: user.following_count ?? 0,
    likesCount:     user.likes_count ?? 0,
    videoCount:     user.video_count ?? 0,
  }
}

// ─── Step 3 — Fetch recent posts ──────────────────────────────────────────────

export interface TikTokVideo {
  id:              string
  title:           string
  video_description?: string
  create_time:     number
  cover_image_url?: string
  share_url?:      string
  like_count?:     number
  comment_count?:  number
  share_count?:    number
  view_count?:     number
}

export async function fetchTikTokVideos(accessToken: string, maxCount = 20): Promise<TikTokVideo[]> {
  const fields = 'id,title,video_description,create_time,cover_image_url,share_url,like_count,comment_count,share_count,view_count'
  const url    = `https://open.tiktokapis.com/v2/video/list/?fields=${fields}`
  
  const res = await httpsPost(url, { max_count: maxCount, cursor: 0 }, accessToken)
  if (res.error?.code && res.error.code !== 'ok') {
    throw new Error(res.error.message ?? 'Failed to fetch video list')
  }
  
  return res.data?.videos ?? []
}

// ─── Step 4 — Full sync: fetch everything and store in SQLite ─────────────────

export interface SyncResult {
  accountId:    string
  postssynced:  number
  postsFailed:  number
  errors:       string[]
}

export async function syncTikTokAnalytics(accountId: string): Promise<SyncResult> {
  const db     = getDatabase()
  const { encryptionKey } = getTikTokConfig()

  // Get account from DB
  const account = db.prepare(
    'SELECT id, workspace_id, access_token, refresh_token, token_expires_at, platform_user_id FROM social_accounts WHERE id = ? AND platform = ?'
  ).get(accountId, 'tiktok') as any

  if (!account) throw new Error('Account not found')

  let accessToken = decrypt(account.access_token, encryptionKey)
  
  // Auto-refresh token if it expires in less than 24 hours
  const expiresAt = new Date(account.token_expires_at).getTime()
  if (expiresAt - Date.now() < 24 * 60 * 60 * 1000) {
    try {
      const refreshToken = decrypt(account.refresh_token, encryptionKey)
      const tokenRes = await refreshTikTokToken(refreshToken)
      
      accessToken = tokenRes.access_token
      const encryptedAccess = encrypt(accessToken, encryptionKey)
      const encryptedRefresh = encrypt(tokenRes.refresh_token, encryptionKey)
      const newExpiresAt = new Date(Date.now() + tokenRes.expires_in * 1000).toISOString()
      
      db.prepare(`UPDATE social_accounts SET access_token = ?, refresh_token = ?, token_expires_at = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(encryptedAccess, encryptedRefresh, newExpiresAt, accountId)
        
      console.log('[TikTok Analytics] Access token refreshed')
    } catch (e: any) {
      console.warn('[TikTok Analytics] Could not refresh token, attempting to use existing:', e.message)
    }
  }

  const result: SyncResult = { accountId, postssynced: 0, postsFailed: 0, errors: [] }

  // 1. Fetch and store account metrics
  try {
    const metrics = await fetchTikTokAccountMetrics(accessToken)
    db.prepare(`DELETE FROM account_metrics WHERE social_account_id = ? AND DATE(recorded_at) = DATE('now')`).run(accountId)
    db.prepare(`
      INSERT INTO account_metrics (id, social_account_id, follower_count, following_count, total_posts, avg_engagement_rate, recorded_at)
      VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
    `).run(randomUUID(), accountId, metrics.followerCount, metrics.followingCount, metrics.videoCount)
    
    // Save total likes to tiktok_account_insights
    db.prepare(`DELETE FROM tiktok_account_insights WHERE social_account_id = ? AND DATE(recorded_at) = DATE('now')`).run(accountId)
    db.prepare(`
      INSERT INTO tiktok_account_insights (id, social_account_id, total_likes, recorded_at)
      VALUES (?, ?, ?, datetime('now'))
    `).run(randomUUID(), accountId, metrics.likesCount)
    
    console.log('[TikTok Analytics] Account metrics saved:', metrics)
  } catch (e: any) {
    result.errors.push(`Account metrics: ${e.message}`)
  }

  // Update last_synced_at
  db.prepare(`UPDATE social_accounts SET last_synced_at = datetime('now') WHERE id = ?`).run(accountId)

  // 2. Fetch recent videos
  let videos: TikTokVideo[] = []
  try {
    videos = await fetchTikTokVideos(accessToken, 20)
    console.log(`[TikTok Analytics] Fetched ${videos.length} videos`)
  } catch (e: any) {
    result.errors.push(`Fetch media: ${e.message}`)
    return result
  }

  // 3. For each video, store in DB
  for (const video of videos) {
    try {
      const publishedAt = new Date(video.create_time * 1000).toISOString()
      const caption = video.title || video.video_description || ''
      
      // Upsert into posts table
      const existingPost = db.prepare(
        `SELECT id FROM posts WHERE workspace_id = ? AND caption = ? AND created_at LIKE ?`
      ).get(account.workspace_id, caption, publishedAt.substring(0, 10) + '%') as any

      let postId = existingPost?.id
      if (!postId) {
        postId = randomUUID()
        db.prepare(`
          INSERT OR IGNORE INTO posts (id, workspace_id, caption, hashtags, status, published_at, created_at, updated_at)
          VALUES (?, ?, ?, '[]', 'published', ?, ?, datetime('now'))
        `).run(postId, account.workspace_id, caption, publishedAt, publishedAt)
      }

      // Upsert post_platform_target
      const existingTarget = db.prepare(
        `SELECT id FROM post_platform_targets WHERE post_id = ? AND platform = ?`
      ).get(postId, 'tiktok') as any

      let targetId = existingTarget?.id
      if (!targetId) {
        targetId = randomUUID()
        db.prepare(`
          INSERT OR IGNORE INTO post_platform_targets (id, post_id, platform, social_account_id, platform_post_id, permalink, status, published_at, thumbnail_url)
          VALUES (?, ?, 'tiktok', ?, ?, ?, 'published', ?, ?)
        `).run(targetId, postId, accountId, video.id, video.share_url ?? '', publishedAt, video.cover_image_url ?? '')
      } else {
        // Update thumbnail url if it exists
        db.prepare(`UPDATE post_platform_targets SET thumbnail_url = ? WHERE id = ?`)
          .run(video.cover_image_url ?? '', targetId)
      }

      // Compute engagement
      const likes    = video.like_count ?? 0
      const comments = video.comment_count ?? 0
      const shares   = video.share_count ?? 0
      const reach    = video.view_count || 1
      const saves    = 0 // Not available in API
      
      const engagements = likes + comments + shares + saves
      const engRate     = parseFloat(((engagements / reach) * 100).toFixed(2))

      // Delete old metrics for this target before inserting fresh ones
      db.prepare('DELETE FROM post_metrics WHERE post_platform_target_id = ?').run(targetId)

      db.prepare(`
        INSERT INTO post_metrics (id, post_platform_target_id, impressions, reach, likes, comments, shares, saves, video_views, engagement_rate, fetched_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        randomUUID(), targetId,
        video.view_count ?? 0, reach,
        likes, comments,
        shares, saves,
        video.view_count ?? null,
        engRate
      )

      result.postssynced++
    } catch (e: any) {
      result.postsFailed++
      result.errors.push(`Video ${video.id}: ${e.message}`)
    }
  }

  console.log(`[TikTok Analytics] Sync complete: ${result.postssynced} posts synced, ${result.postsFailed} failed`)
  return result
}
