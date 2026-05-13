import { createRequire } from 'node:module'
import { getDatabase } from './database'
import { decrypt, encrypt } from './encryption'
import { getInstagramConfig } from './instagramOAuth'
import { randomUUID } from 'node:crypto'

const require = createRequire(import.meta.url)
const https   = require('node:https')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function httpsGet(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    https.get(url, (res: any) => {
      let data = ''
      res.on('data', (chunk: string) => (data += chunk))
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch { reject(new Error('Failed to parse response')) }
      })
    }).on('error', reject)
  })
}

// ─── Step 1 — Exchange short-lived token for long-lived (60 days) ─────────────

export async function exchangeForLongLivedToken(shortToken: string): Promise<string> {
  const { clientSecret } = getInstagramConfig()
  const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${shortToken}`
  const res = await httpsGet(url)
  if (res.error) throw new Error(res.error.message ?? 'Token exchange failed')
  console.log('[Instagram Analytics] Long-lived token obtained, expires in', res.token_type)
  return res.access_token
}

// ─── Step 2 — Fetch account-level metrics ─────────────────────────────────────

export async function fetchAccountMetrics(accessToken: string): Promise<{
  followersCount: number
  mediaCount: number
}> {
  const url = `https://graph.instagram.com/me?fields=followers_count,media_count&access_token=${accessToken}`
  const res = await httpsGet(url)
  if (res.error) throw new Error(res.error.message)
  return {
    followersCount: res.followers_count ?? 0,
    mediaCount:     res.media_count ?? 0,
  }
}

// ─── Fetch account-level daily insights (reach, impressions, profile views) ───

export interface AccountInsights {
  reach:         number
  impressions:   number
  profileViews:  number
  websiteClicks: number
}

export async function fetchAccountInsights(userId: string, accessToken: string): Promise<AccountInsights> {
  const metrics = 'reach,impressions,profile_views,website_clicks'
  const url     = `https://graph.instagram.com/${userId}/insights?metric=${metrics}&period=day&access_token=${accessToken}`
  const res     = await httpsGet(url)

  if (res.error) {
    console.warn('[Instagram Analytics] Account insights unavailable:', res.error.message)
    return { reach: 0, impressions: 0, profileViews: 0, websiteClicks: 0 }
  }

  const data: Record<string, number> = {}
  for (const item of (res.data ?? [])) {
    const latest = item.values?.[item.values.length - 1]?.value ?? 0
    data[item.name] = latest
  }

  return {
    reach:         data.reach ?? 0,
    impressions:   data.impressions ?? 0,
    profileViews:  data.profile_views ?? 0,
    websiteClicks: data.website_clicks ?? 0,
  }
}

// ─── Fetch audience demographics ──────────────────────────────────────────────

export interface AudienceDemographics {
  topCountries:  { label: string; value: number }[]
  topCities:     { label: string; value: number }[]
  genderAge:     { label: string; value: number }[]
}

export async function fetchAudienceDemographics(userId: string, accessToken: string): Promise<AudienceDemographics> {
  const empty = { topCountries: [], topCities: [], genderAge: [] }

  try {
    const metrics = 'audience_country,audience_city,audience_gender_age'
    const url     = `https://graph.instagram.com/${userId}/insights?metric=${metrics}&period=lifetime&access_token=${accessToken}`
    const res     = await httpsGet(url)

    if (res.error) {
      console.warn('[Instagram Analytics] Demographics unavailable:', res.error.message)
      return empty
    }

    const result: AudienceDemographics = { topCountries: [], topCities: [], genderAge: [] }

    for (const item of (res.data ?? [])) {
      const values = item.values?.[0]?.value ?? {}
      const sorted = Object.entries(values as Record<string, number>)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([label, value]) => ({ label, value }))

      if (item.name === 'audience_country') result.topCountries = sorted
      if (item.name === 'audience_city')    result.topCities    = sorted
      if (item.name === 'audience_gender_age') result.genderAge = sorted
    }

    return result
  } catch (e) {
    return empty
  }
}

// ─── Calculate best posting times from existing post data ─────────────────────

export function calculateBestPostingTimes(posts: { timestamp: string; engagement_rate: number }[]): {
  hour: number; dayOfWeek: number; avgEngagement: number; postCount: number
}[] {
  const slots: Record<string, { total: number; count: number }> = {}

  for (const post of posts) {
    const d   = new Date(post.timestamp)
    const key = `${d.getDay()}-${d.getHours()}`
    if (!slots[key]) slots[key] = { total: 0, count: 0 }
    slots[key].total += post.engagement_rate
    slots[key].count++
  }

  return Object.entries(slots)
    .map(([key, val]) => {
      const [day, hour] = key.split('-').map(Number)
      return {
        dayOfWeek:     day,
        hour,
        avgEngagement: parseFloat((val.total / val.count).toFixed(2)),
        postCount:     val.count,
      }
    })
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
}

// ─── Extract hashtag performance from posts ───────────────────────────────────

export function extractHashtagPerformance(posts: { caption?: string; engagement_rate: number; likes: number }[]): {
  hashtag: string; avgEngagement: number; totalLikes: number; postCount: number
}[] {
  const tags: Record<string, { totalEng: number; totalLikes: number; count: number }> = {}

  for (const post of posts) {
    if (!post.caption) continue
    const matches = post.caption.match(/#[\w\u00C0-\u024F]+/g) ?? []
    for (const tag of matches) {
      const t = tag.toLowerCase()
      if (!tags[t]) tags[t] = { totalEng: 0, totalLikes: 0, count: 0 }
      tags[t].totalEng   += post.engagement_rate
      tags[t].totalLikes += post.likes
      tags[t].count++
    }
  }

  return Object.entries(tags)
    .map(([hashtag, val]) => ({
      hashtag,
      avgEngagement: parseFloat((val.totalEng / val.count).toFixed(2)),
      totalLikes:    val.totalLikes,
      postCount:     val.count,
    }))
    .sort((a, b) => b.avgEngagement - a.avgEngagement)
    .slice(0, 20)
}

// ─── Step 3 — Fetch recent posts ──────────────────────────────────────────────

export interface InstagramMedia {
  id:              string
  caption?:        string
  media_type:      'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  timestamp:       string
  permalink?:      string
  thumbnail_url?:  string
  media_url?:      string
  like_count?:     number
  comments_count?: number
}

export async function fetchRecentMedia(accessToken: string, limit = 20): Promise<InstagramMedia[]> {
  const fields = 'id,caption,media_type,timestamp,permalink,thumbnail_url,media_url,like_count,comments_count'
  const url    = `https://graph.instagram.com/me/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`
  const res    = await httpsGet(url)
  if (res.error) throw new Error(res.error.message)
  return res.data ?? []
}

// ─── Step 4 — Fetch insights for a single post ────────────────────────────────

export interface PostInsights {
  impressions:     number
  reach:           number
  likes:           number
  comments:        number
  shares:          number
  saves:           number
  video_views?:    number
  engagement_rate: number
}

export async function fetchPostInsights(mediaId: string, mediaType: string, accessToken: string): Promise<PostInsights> {
  // Try different metric sets — Instagram is inconsistent across media types and account types
  const metricSets = [
    'reach,likes,comments,shares,saved',                          // works for most
    'impressions,reach,likes,comments,shares,saved',              // images/carousels
    'reach,likes,comments,shares,saved,total_interactions',       // newer API
  ]

  for (const metrics of metricSets) {
    const url = `https://graph.instagram.com/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`
    const res = await httpsGet(url)

    if (!res.error) {
      const data: Record<string, number> = {}
      for (const item of (res.data ?? [])) {
        data[item.name] = item.values?.[0]?.value ?? item.value ?? 0
      }
      const reach       = data.reach || 1
      const engagements = (data.likes ?? 0) + (data.comments ?? 0) + (data.shares ?? 0) + (data.saved ?? 0)
      return {
        impressions:     data.impressions ?? data.total_interactions ?? 0,
        reach:           data.reach ?? 0,
        likes:           data.likes ?? 0,
        comments:        data.comments ?? 0,
        shares:          data.shares ?? 0,
        saves:           data.saved ?? 0,
        video_views:     data.video_views ?? data.plays ?? undefined,
        engagement_rate: parseFloat(((engagements / reach) * 100).toFixed(2)),
      }
    }
  }

  // All metric sets failed — use zeros, like_count/comments_count used as fallback in caller
  console.warn(`[Instagram Analytics] All insight metrics failed for ${mediaId} (${mediaType})`)
  return { impressions: 0, reach: 0, likes: 0, comments: 0, shares: 0, saves: 0, engagement_rate: 0 }
}

// ─── Step 5 — Full sync: fetch everything and store in SQLite ─────────────────

export interface SyncResult {
  accountId:    string
  postssynced:  number
  postsFailed:  number
  errors:       string[]
}

export async function syncInstagramAnalytics(accountId: string): Promise<SyncResult> {
  const db     = getDatabase()
  const { encryptionKey } = getInstagramConfig()

  // Get account from DB
  const account = db.prepare(
    'SELECT id, workspace_id, access_token, platform_user_id FROM social_accounts WHERE id = ? AND platform = ?'
  ).get(accountId, 'instagram') as any

  if (!account) throw new Error('Account not found')

  // Decrypt token
  let accessToken = decrypt(account.access_token, encryptionKey)

  // Exchange for long-lived token if needed and update DB
  try {
    const longToken = await exchangeForLongLivedToken(accessToken)
    if (longToken !== accessToken) {
      const encryptedLong = encrypt(longToken, encryptionKey)
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString() // 60 days
      db.prepare(`UPDATE social_accounts SET access_token = ?, token_expires_at = ?, updated_at = datetime('now') WHERE id = ?`)
        .run(encryptedLong, expiresAt, accountId)
      accessToken = longToken
      console.log('[Instagram Analytics] Token upgraded to long-lived')
    }
  } catch (e) {
    console.warn('[Instagram Analytics] Could not exchange for long-lived token, using existing')
  }

  const result: SyncResult = { accountId, postssynced: 0, postsFailed: 0, errors: [] }

  // Fetch and store account metrics
  try {
    const metrics = await fetchAccountMetrics(accessToken)
    // Delete today's existing entry first to avoid duplicates
    db.prepare(`DELETE FROM account_metrics WHERE social_account_id = ? AND DATE(recorded_at) = DATE('now')`).run(accountId)
    db.prepare(`
      INSERT INTO account_metrics (id, social_account_id, follower_count, following_count, total_posts, avg_engagement_rate, recorded_at)
      VALUES (?, ?, ?, 0, ?, 0, datetime('now'))
    `).run(randomUUID(), accountId, metrics.followersCount, metrics.mediaCount)
    console.log('[Instagram Analytics] Account metrics saved:', metrics)
  } catch (e: any) {
    result.errors.push(`Account metrics: ${e.message}`)
  }

  // Update last_synced_at
  db.prepare(`UPDATE social_accounts SET last_synced_at = datetime('now') WHERE id = ?`).run(accountId)

  // Fetch recent posts
  let media: InstagramMedia[] = []
  try {
    media = await fetchRecentMedia(accessToken, 25)
    console.log(`[Instagram Analytics] Fetched ${media.length} posts`)
  } catch (e: any) {
    result.errors.push(`Fetch media: ${e.message}`)
    return result
  }

  // For each post, fetch insights and store
  for (const post of media) {
    try {
      // Upsert into posts table
      const existingPost = db.prepare(
        `SELECT id FROM posts WHERE workspace_id = ? AND caption = ? AND created_at LIKE ?`
      ).get(account.workspace_id, post.caption ?? '', post.timestamp.substring(0, 10) + '%') as any

      let postId = existingPost?.id
      if (!postId) {
        postId = randomUUID()
        db.prepare(`
          INSERT OR IGNORE INTO posts (id, workspace_id, caption, hashtags, status, published_at, created_at, updated_at)
          VALUES (?, ?, ?, '[]', 'published', ?, ?, datetime('now'))
        `).run(postId, account.workspace_id, post.caption ?? '', post.timestamp, post.timestamp)
      }

      // Upsert post_platform_target
      const existingTarget = db.prepare(
        `SELECT id FROM post_platform_targets WHERE post_id = ? AND platform = ?`
      ).get(postId, 'instagram') as any

      let targetId = existingTarget?.id
      if (!targetId) {
        targetId = randomUUID()
        db.prepare(`
          INSERT OR IGNORE INTO post_platform_targets (id, post_id, platform, social_account_id, platform_post_id, permalink, status, published_at)
          VALUES (?, ?, 'instagram', ?, ?, ?, 'published', ?)
        `).run(targetId, postId, accountId, post.id, post.permalink ?? '', post.timestamp)
      }

      // Fetch and store insights
      const insights = await fetchPostInsights(post.id, post.media_type, accessToken)

      // Use direct counts as fallback if insights returned zeros
      const finalLikes    = insights.likes    || post.like_count     || 0
      const finalComments = insights.comments || post.comments_count || 0
      const finalReach    = insights.reach    || 1
      const engagements   = finalLikes + finalComments + insights.shares + insights.saves
      const engRate       = insights.engagement_rate || parseFloat(((engagements / finalReach) * 100).toFixed(2))

      // Delete old metrics for this target before inserting fresh ones
      db.prepare('DELETE FROM post_metrics WHERE post_platform_target_id = ?').run(targetId)

      db.prepare(`
        INSERT INTO post_metrics (id, post_platform_target_id, impressions, reach, likes, comments, shares, saves, video_views, engagement_rate, fetched_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(
        randomUUID(), targetId,
        insights.impressions, insights.reach,
        finalLikes, finalComments,
        insights.shares, insights.saves,
        insights.video_views ?? null,
        engRate
      )

      result.postssynced++
    } catch (e: any) {
      result.postsFailed++
      result.errors.push(`Post ${post.id}: ${e.message}`)
    }
  }

  console.log(`[Instagram Analytics] Sync complete: ${result.postssynced} posts synced, ${result.postsFailed} failed`)

  // ── Extended analytics ────────────────────────────────────────────────────

  // Account-level daily insights (reach, impressions, profile views, website clicks)
  try {
    const insights = await fetchAccountInsights(account.platform_user_id, accessToken)
    db.prepare(`
      INSERT OR REPLACE INTO instagram_account_insights
        (id, social_account_id, reach, impressions, profile_views, website_clicks, recorded_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(randomUUID(), accountId, insights.reach, insights.impressions, insights.profileViews, insights.websiteClicks)
    console.log('[Instagram Analytics] Account insights saved:', insights)
  } catch (e: any) {
    result.errors.push(`Account insights: ${e.message}`)
  }

  // Audience demographics
  try {
    const demo = await fetchAudienceDemographics(account.platform_user_id, accessToken)
    db.prepare(`DELETE FROM instagram_audience_demographics WHERE social_account_id = ?`).run(accountId)
    for (const c of demo.topCountries) {
      db.prepare(`INSERT INTO instagram_audience_demographics (id, social_account_id, type, label, value) VALUES (?, ?, 'country', ?, ?)`)
        .run(randomUUID(), accountId, c.label, c.value)
    }
    for (const c of demo.topCities) {
      db.prepare(`INSERT INTO instagram_audience_demographics (id, social_account_id, type, label, value) VALUES (?, ?, 'city', ?, ?)`)
        .run(randomUUID(), accountId, c.label, c.value)
    }
    for (const g of demo.genderAge) {
      db.prepare(`INSERT INTO instagram_audience_demographics (id, social_account_id, type, label, value) VALUES (?, ?, 'gender_age', ?, ?)`)
        .run(randomUUID(), accountId, g.label, g.value)
    }
    console.log('[Instagram Analytics] Demographics saved')
  } catch (e: any) {
    result.errors.push(`Demographics: ${e.message}`)
  }

  // Best posting times & hashtag performance (calculated from synced posts)
  try {
    const syncedPosts = db.prepare(`
      SELECT p.published_at as timestamp, pm.engagement_rate, pm.likes, p.caption
      FROM posts p
      JOIN post_platform_targets ppt ON ppt.post_id = p.id
      JOIN post_metrics pm ON pm.post_platform_target_id = ppt.id
      WHERE ppt.social_account_id = ? AND p.published_at IS NOT NULL
    `).all(accountId) as any[]

    const bestTimes = calculateBestPostingTimes(syncedPosts)
    db.prepare(`DELETE FROM instagram_posting_times WHERE social_account_id = ?`).run(accountId)
    for (const t of bestTimes) {
      db.prepare(`INSERT INTO instagram_posting_times (id, social_account_id, hour, day_of_week, avg_engagement, post_count) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(randomUUID(), accountId, t.hour, t.dayOfWeek, t.avgEngagement, t.postCount)
    }

    const hashtags = extractHashtagPerformance(syncedPosts)
    db.prepare(`DELETE FROM instagram_hashtag_performance WHERE social_account_id = ?`).run(accountId)
    for (const h of hashtags) {
      db.prepare(`INSERT INTO instagram_hashtag_performance (id, social_account_id, hashtag, avg_engagement, total_likes, post_count) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(randomUUID(), accountId, h.hashtag, h.avgEngagement, h.totalLikes, h.postCount)
    }
    console.log('[Instagram Analytics] Posting times and hashtags saved')
  } catch (e: any) {
    result.errors.push(`Posting times/hashtags: ${e.message}`)
  }

  return result
}
