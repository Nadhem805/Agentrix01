import { createRequire } from 'node:module'
import { getDatabase } from './database'
import { decrypt, encrypt } from './encryption'
import { getYouTubeConfig, fetchYouTubeProfile } from './youtubeOAuth'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const https   = require('node:https')

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

export async function refreshYouTubeToken(refreshToken: string): Promise<{ access_token: string, expires_in: number, scope: string, token_type: string }> {
  const { clientId, clientSecret } = getYouTubeConfig()
  
  const body = new URLSearchParams({
    client_id:     clientId,
    client_secret: clientSecret,
    grant_type:    'refresh_token',
    refresh_token: refreshToken,
  }).toString()

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path:     '/token',
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

export async function fetchYouTubeAccountMetrics(accessToken: string): Promise<{
  subscriberCount: number
  videoCount:      number
  viewCount:       number
}> {
  const url = `https://youtube.googleapis.com/youtube/v3/channels?part=statistics&mine=true`
  
  const res = await httpsGet(url, accessToken)
  if (res.error) {
    throw new Error(res.error.message ?? 'Failed to fetch channel stats')
  }
  
  if (!res.items || res.items.length === 0) {
    throw new Error('No YouTube channel found for this user')
  }

  const stats = res.items[0].statistics
  return {
    subscriberCount: parseInt(stats.subscriberCount ?? '0', 10),
    videoCount:      parseInt(stats.videoCount ?? '0', 10),
    viewCount:       parseInt(stats.viewCount ?? '0', 10),
  }
}

// ─── Step 3 — Fetch recent videos ──────────────────────────────────────────────
export interface YouTubeVideo {
  id:              string
  title:           string
  description:     string
  publishedAt:     string
  thumbnailUrl:    string
  viewCount:       number
  likeCount:       number
  commentCount:    number
}

export async function fetchYouTubeVideos(accessToken: string, maxResults = 20): Promise<YouTubeVideo[]> {
  // First get the playlist ID for "uploads" from the channel
  const channelUrl = `https://youtube.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true`
  const channelRes = await httpsGet(channelUrl, accessToken)
  
  if (channelRes.error || !channelRes.items || channelRes.items.length === 0) {
    throw new Error('Failed to fetch channel upload playlist')
  }
  
  const uploadsPlaylistId = channelRes.items[0].contentDetails.relatedPlaylists.uploads
  
  // Then get items from that playlist
  const playlistUrl = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}`
  const playlistRes = await httpsGet(playlistUrl, accessToken)
  
  if (playlistRes.error || !playlistRes.items) {
      throw new Error('Failed to fetch playlist items')
  }

  const videoIds = playlistRes.items.map((item: any) => item.snippet.resourceId.videoId).join(',')
  if (!videoIds) return []

  // Finally get stats for those videos
  const statsUrl = `https://youtube.googleapis.com/youtube/v3/videos?part=statistics,snippet&id=${videoIds}`
  const statsRes = await httpsGet(statsUrl, accessToken)

  if (statsRes.error || !statsRes.items) {
      throw new Error('Failed to fetch video statistics')
  }

  return statsRes.items.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || '',
    viewCount: parseInt(item.statistics.viewCount ?? '0', 10),
    likeCount: parseInt(item.statistics.likeCount ?? '0', 10),
    commentCount: parseInt(item.statistics.commentCount ?? '0', 10)
  }))
}

// ─── Step 4 — Full sync: fetch everything and store in SQLite ─────────────────

export interface SyncResult {
  accountId:    string
  postssynced:  number
  postsFailed:  number
  errors:       string[]
}

export async function syncYouTubeAnalytics(accountId: string): Promise<SyncResult> {
  const db     = getDatabase()
  const { encryptionKey } = getYouTubeConfig()

  // Get account from DB
  const account = db.prepare(
    'SELECT id, workspace_id, access_token, refresh_token, token_expires_at, platform_user_id FROM social_accounts WHERE id = ? AND platform = ?'
  ).get(accountId, 'youtube') as any

  if (!account) throw new Error('Account not found')

  let accessToken = decrypt(account.access_token, encryptionKey)
  
  // Auto-refresh token if it expires in less than 1 hour
  const expiresAt = new Date(account.token_expires_at).getTime()
  if (expiresAt - Date.now() < 60 * 60 * 1000) {
    try {
      if (!account.refresh_token) {
         throw new Error("No refresh token available")
      }
      const refreshToken = decrypt(account.refresh_token, encryptionKey)
      const tokenRes = await refreshYouTubeToken(refreshToken)
      
      accessToken = tokenRes.access_token
      const encryptedAccess = encrypt(accessToken, encryptionKey)
      const newExpiresAt = new Date(Date.now() + tokenRes.expires_in * 1000).toISOString()
      
      db.prepare(`UPDATE social_accounts SET access_token = ?, token_expires_at = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(encryptedAccess, newExpiresAt, accountId)
        
      console.log('[YouTube Analytics] Access token refreshed')
    } catch (e: any) {
      console.warn('[YouTube Analytics] Could not refresh token, attempting to use existing:', e.message)
    }
  }

  const result: SyncResult = { accountId, postssynced: 0, postsFailed: 0, errors: [] }

  // 1. Fetch and store account metrics
  try {
    try {
      const profile = await fetchYouTubeProfile(accessToken)
      if (profile.avatar_url) {
        db.prepare('UPDATE social_accounts SET avatar_url = ? WHERE id = ?').run(profile.avatar_url, accountId)
        console.log('[YouTube Analytics] Updated channel avatar_url during sync')
      }
    } catch (e: any) {
      console.warn('[YouTube Analytics] Failed to sync avatar_url:', e.message)
    }

    const metrics = await fetchYouTubeAccountMetrics(accessToken)
    db.prepare(`DELETE FROM account_metrics WHERE social_account_id = ? AND DATE(recorded_at) = DATE('now')`).run(accountId)
    db.prepare(`
      INSERT INTO account_metrics (id, social_account_id, follower_count, following_count, total_posts, avg_engagement_rate, recorded_at)
      VALUES (?, ?, ?, 0, ?, 0, datetime('now'))
    `).run(randomUUID(), accountId, metrics.subscriberCount, metrics.videoCount)
    
    // Save total views (YouTube doesn't have total likes at channel level) to a table if needed.
    // For now we'll just log it or we could add a custom table.
    
    console.log('[YouTube Analytics] Account metrics saved:', metrics)
  } catch (e: any) {
    result.errors.push(`Account metrics: ${e.message}`)
  }

  // Update last_synced_at
  db.prepare(`UPDATE social_accounts SET last_synced_at = datetime('now') WHERE id = ?`).run(accountId)

  // 2. Fetch recent videos
  let videos: YouTubeVideo[] = []
  try {
    videos = await fetchYouTubeVideos(accessToken, 20)
    console.log(`[YouTube Analytics] Fetched ${videos.length} videos`)
  } catch (e: any) {
    result.errors.push(`Fetch media: ${e.message}`)
    return result
  }

  // 3. For each video, store in DB
  for (const video of videos) {
    try {
      const publishedAt = new Date(video.publishedAt).toISOString()
      const caption = video.title || ''
      
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
      ).get(postId, 'youtube') as any

      const permalink = `https://youtube.com/watch?v=${video.id}`

      let targetId = existingTarget?.id
      if (!targetId) {
        targetId = randomUUID()
        db.prepare(`
          INSERT OR IGNORE INTO post_platform_targets (id, post_id, platform, social_account_id, platform_post_id, permalink, status, published_at, thumbnail_url)
          VALUES (?, ?, 'youtube', ?, ?, ?, 'published', ?, ?)
        `).run(targetId, postId, accountId, video.id, permalink, publishedAt, video.thumbnailUrl)
      } else {
        // Update thumbnail url if it exists
        db.prepare(`UPDATE post_platform_targets SET thumbnail_url = ? WHERE id = ?`)
          .run(video.thumbnailUrl, targetId)
      }

      // Compute engagement
      const likes    = video.likeCount
      const comments = video.commentCount
      const reach    = video.viewCount || 1
      
      const engagements = likes + comments
      const engRate     = parseFloat(((engagements / reach) * 100).toFixed(2))

      // Delete old metrics for this target before inserting fresh ones
      db.prepare('DELETE FROM post_metrics WHERE post_platform_target_id = ?').run(targetId)

      db.prepare(`
        INSERT INTO post_metrics (id, post_platform_target_id, impressions, reach, likes, comments, shares, saves, video_views, engagement_rate, fetched_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?, datetime('now'))
      `).run(
        randomUUID(), targetId,
        video.viewCount, reach,
        likes, comments,
        video.viewCount,
        engRate
      )

      result.postssynced++
    } catch (e: any) {
      result.postsFailed++
      result.errors.push(`Video ${video.id}: ${e.message}`)
    }
  }

  console.log(`[YouTube Analytics] Sync complete: ${result.postssynced} posts synced, ${result.postsFailed} failed`)
  return result
}
