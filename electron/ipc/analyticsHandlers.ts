import type { IpcMain } from 'electron'
import { getDatabase } from '../services/database'
import { syncInstagramAnalytics } from '../services/instagramAnalytics'
import { syncTikTokAnalytics } from '../services/tiktokAnalytics'
import { syncYouTubeAnalytics } from '../services/youtubeAnalytics'

function getDateThreshold(range?: string): string | null {
  if (range === 'all') return null
  if (range === '7d') return "datetime('now', '-7 days')"
  if (range === '90d') return "datetime('now', '-90 days')"
  return "datetime('now', '-30 days')" // default to 30d
}

export function registerAnalyticsHandlers(ipcMain: IpcMain) {

  // ── Sync analytics for a specific connected account ───────────────────
  ipcMain.handle('analytics:sync', async (_event, workspaceId: string, accountId?: string) => {
    const db = getDatabase()

    // Clean up duplicate metrics from previous syncs
    db.prepare(`
      DELETE FROM post_metrics WHERE id NOT IN (
        SELECT id FROM post_metrics GROUP BY post_platform_target_id HAVING id = MAX(id)
      )
    `).run()
    db.prepare(`
      DELETE FROM post_platform_targets WHERE id NOT IN (
        SELECT id FROM post_platform_targets GROUP BY platform_post_id HAVING id = MAX(id)
      )
    `).run()
    db.prepare(`
      DELETE FROM posts WHERE id NOT IN (
        SELECT id FROM posts GROUP BY caption, DATE(published_at) HAVING id = MAX(id)
      )
    `).run()
    db.prepare(`
      DELETE FROM account_metrics WHERE id NOT IN (
        SELECT id FROM account_metrics GROUP BY social_account_id, DATE(recorded_at) HAVING id = MAX(id)
      )
    `).run()
    
    console.log(`[Analytics] Syncing for workspace: ${workspaceId}, account: ${accountId || 'ALL'}`)

    const filter = accountId ? 'AND id = ?' : ''
    const params = accountId ? [workspaceId, accountId] : [workspaceId]

    const accounts = db.prepare(
      `SELECT id, platform_username, platform FROM social_accounts WHERE workspace_id = ? AND is_active = 1 ${filter}`
    ).all(...params) as { id: string; platform_username: string; platform: string }[]

    console.log('[Analytics] Found accounts:', accounts.length, accounts.map(a => `${a.platform_username} (${a.platform})`))

    const results = []
    for (const account of accounts) {
      try {
        let result
        if (account.platform === 'instagram') {
          result = await syncInstagramAnalytics(account.id)
        } else if (account.platform === 'tiktok') {
          result = await syncTikTokAnalytics(account.id)
        } else if (account.platform === 'youtube') {
          result = await syncYouTubeAnalytics(account.id)
        } else {
          console.warn(`[Analytics] Sync not implemented for platform: ${account.platform}`)
          continue
        }
        results.push(result)
      } catch (e: any) {
        console.error('[Analytics] Sync error for account', account.id, ':', e.message)
        results.push({ accountId: account.id, error: e.message })
      }
    }
    return results
  })

  // ── Overview stats ─────────────────────────────────────────────────────────
  ipcMain.handle('analytics:overview', async (_event, workspaceId: string, accountId?: string, range?: string) => {
    const db = getDatabase()
    const dateThreshold = getDateThreshold(range)
    const rangeFilter = dateThreshold ? `AND p.published_at >= ${dateThreshold}` : ''

    // Calculate totalPosts specific to the account (if provided) and date range
    const totalPosts = accountId
      ? (db.prepare(`
          SELECT COUNT(DISTINCT ppt.post_id) as count
          FROM post_platform_targets ppt
          JOIN posts p ON ppt.post_id = p.id
          WHERE p.workspace_id = ? AND ppt.social_account_id = ? ${rangeFilter}
        `).get(workspaceId, accountId) as any)?.count ?? 0
      : (db.prepare(`
          SELECT COUNT(*) as count 
          FROM posts 
          WHERE workspace_id = ? ${dateThreshold ? `AND published_at >= ${dateThreshold}` : ''}
        `).get(workspaceId) as any)?.count ?? 0

    const accountFilter = accountId ? 'AND ppt.social_account_id = ?' : ''
    const params = accountId ? [workspaceId, accountId] : [workspaceId]

    const engagements = (db.prepare(`
      SELECT COALESCE(SUM(pm.likes + pm.comments + pm.shares + pm.saves), 0) as total
      FROM post_metrics pm
      JOIN post_platform_targets ppt ON pm.post_platform_target_id = ppt.id
      JOIN posts p ON ppt.post_id = p.id
      WHERE p.workspace_id = ? ${rangeFilter} ${accountFilter}
    `).get(...params) as any)?.total ?? 0

    const avgEngagement = (db.prepare(`
      SELECT COALESCE(AVG(pm.engagement_rate), 0) as avg
      FROM post_metrics pm
      JOIN post_platform_targets ppt ON pm.post_platform_target_id = ppt.id
      JOIN posts p ON ppt.post_id = p.id
      WHERE p.workspace_id = ? ${rangeFilter} ${accountFilter}
    `).get(...params) as any)?.avg ?? 0

    const latestMetrics = db.prepare(`
      SELECT follower_count, following_count FROM account_metrics am
      JOIN social_accounts sa ON am.social_account_id = sa.id
      WHERE sa.workspace_id = ? ${accountId ? 'AND sa.id = ?' : ''}
      ORDER BY am.recorded_at DESC LIMIT 1
    `).get(...params) as any
    
    const latestFollowers = latestMetrics?.follower_count ?? 0
    const latestFollowing = latestMetrics?.following_count ?? 0

    const impressions = (db.prepare(`
      SELECT COALESCE(SUM(pm.impressions), 0) as total
      FROM post_metrics pm
      JOIN post_platform_targets ppt ON pm.post_platform_target_id = ppt.id
      JOIN posts p ON ppt.post_id = p.id
      WHERE p.workspace_id = ? ${rangeFilter} ${accountFilter}
    `).get(...params) as any)?.total ?? 0

    let tiktokLikes = 0
    let instagramReach = 0
    let youtubeLikes = 0
    let youtubeComments = 0

    if (accountId) {
      const accountInfo = db.prepare(`SELECT platform FROM social_accounts WHERE id = ?`).get(accountId) as any
      const platform = accountInfo?.platform

      if (platform === 'tiktok') {
        tiktokLikes = (db.prepare(`
          SELECT total_likes FROM tiktok_account_insights
          WHERE social_account_id = ?
          ORDER BY recorded_at DESC LIMIT 1
        `).get(accountId) as any)?.total_likes ?? 0
      } else if (platform === 'instagram') {
        instagramReach = (db.prepare(`
          SELECT reach FROM instagram_account_insights
          WHERE social_account_id = ?
          ORDER BY recorded_at DESC LIMIT 1
        `).get(accountId) as any)?.reach ?? 0
      } else if (platform === 'youtube') {
        const ytStats = db.prepare(`
          SELECT COALESCE(SUM(pm.likes), 0) as likes, COALESCE(SUM(pm.comments), 0) as comments
          FROM post_metrics pm
          JOIN post_platform_targets ppt ON pm.post_platform_target_id = ppt.id
          JOIN posts p ON ppt.post_id = p.id
          WHERE ppt.social_account_id = ? ${rangeFilter}
        `).get(accountId) as any
        youtubeLikes = ytStats?.likes ?? 0
        youtubeComments = ytStats?.comments ?? 0
      }
    }

    return {
      totalPosts,
      totalEngagements: engagements,
      avgEngagementRate: parseFloat(avgEngagement.toFixed(2)),
      followerCount: latestFollowers,
      followingCount: latestFollowing,
      impressions,
      tiktokLikes,
      instagramReach,
      youtubeLikes,
      youtubeComments,
    }
  })

  // ── Top posts ──────────────────────────────────────────────────────────────
  ipcMain.handle('analytics:top-posts', async (_event, workspaceId: string, limit = 10, accountId?: string, range?: string) => {
    const db = getDatabase()
    const dateThreshold = getDateThreshold(range)
    const rangeFilter = dateThreshold ? `AND p.published_at >= ${dateThreshold}` : ''
    const accountFilter = accountId ? 'AND ppt.social_account_id = ?' : ''
    const params = accountId ? [workspaceId, accountId, limit] : [workspaceId, limit]
    return db.prepare(`
      SELECT
        p.id, p.caption, ppt.platform, ppt.permalink, ppt.thumbnail_url,
        pm.likes, pm.comments, pm.shares, pm.saves,
        pm.impressions, pm.reach, pm.video_views,
        pm.engagement_rate, p.published_at
      FROM post_metrics pm
      JOIN post_platform_targets ppt ON pm.post_platform_target_id = ppt.id
      JOIN posts p ON ppt.post_id = p.id
      WHERE p.workspace_id = ? 
        ${rangeFilter}
        ${accountFilter}
      ORDER BY pm.engagement_rate DESC
      LIMIT ?
    `).all(...params)
  })

  // ── Engagement trend (last 30 days) ───────────────────────────────────────
  ipcMain.handle('analytics:trend', async (_event, workspaceId: string, accountId?: string, range?: string) => {
    const db = getDatabase()
    const dateThreshold = getDateThreshold(range)
    const rangeFilter = dateThreshold ? `AND p.published_at >= ${dateThreshold}` : ''
    const accountFilter = accountId ? 'AND ppt.social_account_id = ?' : ''
    const params = accountId ? [workspaceId, accountId] : [workspaceId]
    return db.prepare(`
      SELECT
        DATE(p.published_at) as date,
        ROUND(AVG(pm.engagement_rate), 2) as avg_engagement,
        SUM(pm.likes) as likes,
        SUM(pm.comments) as comments,
        SUM(pm.shares) as shares,
        COUNT(*) as post_count
      FROM post_metrics pm
      JOIN post_platform_targets ppt ON pm.post_platform_target_id = ppt.id
      JOIN posts p ON ppt.post_id = p.id
      WHERE p.workspace_id = ?
        AND p.published_at IS NOT NULL
        ${rangeFilter}
        ${accountFilter}
      GROUP BY DATE(p.published_at)
      ORDER BY date ASC
    `).all(...params)
  })

  // ── Account metrics history ────────────────────────────────────────────────
  ipcMain.handle('analytics:account-metrics', async (_event, workspaceId: string, accountId?: string) => {
    const db = getDatabase()
    const accountFilter = accountId ? 'AND sa.id = ?' : ''
    const params = accountId ? [workspaceId, accountId] : [workspaceId]
    return db.prepare(`
      SELECT am.follower_count, am.following_count, am.total_posts, am.recorded_at, sa.platform
      FROM account_metrics am
      JOIN social_accounts sa ON am.social_account_id = sa.id
      WHERE sa.workspace_id = ? ${accountFilter}
      ORDER BY am.recorded_at DESC
      LIMIT 90
    `).all(...params)
  })

  ipcMain.handle('analytics:account-insights', async (_event, workspaceId: string, accountId?: string) => {
    const db = getDatabase()
    const accountFilter = accountId ? 'AND sa.id = ?' : ''
    const params = accountId ? [workspaceId, accountId] : [workspaceId]
    return db.prepare(`
      SELECT iai.reach, iai.impressions, iai.profile_views, iai.website_clicks, iai.recorded_at
      FROM instagram_account_insights iai
      JOIN social_accounts sa ON iai.social_account_id = sa.id
      WHERE sa.workspace_id = ? ${accountFilter}
      ORDER BY iai.recorded_at DESC
      LIMIT 30
    `).all(...params)
  })

  ipcMain.handle('analytics:demographics', async (_event, workspaceId: string, accountId?: string) => {
    const db = getDatabase()
    const accountFilter = accountId ? 'AND sa.id = ?' : ''
    const params = accountId ? [workspaceId, accountId] : [workspaceId]
    const rows = db.prepare(`
      SELECT iad.type, iad.label, iad.value
      FROM instagram_audience_demographics iad
      JOIN social_accounts sa ON iad.social_account_id = sa.id
      WHERE sa.workspace_id = ? ${accountFilter}
      ORDER BY iad.value DESC
    `).all(...params) as { type: string; label: string; value: number }[]

    return {
      countries: rows.filter(r => r.type === 'country').slice(0, 8),
      cities:    rows.filter(r => r.type === 'city').slice(0, 8),
      genderAge: rows.filter(r => r.type === 'gender_age'),
    }
  })

  ipcMain.handle('analytics:posting-times', async (_event, workspaceId: string, accountId?: string) => {
    const db = getDatabase()
    const accountFilter = accountId ? 'AND sa.id = ?' : ''
    const params = accountId ? [workspaceId, accountId] : [workspaceId]
    return db.prepare(`
      SELECT ipt.hour, ipt.day_of_week, ipt.avg_engagement, ipt.post_count
      FROM instagram_posting_times ipt
      JOIN social_accounts sa ON ipt.social_account_id = sa.id
      WHERE sa.workspace_id = ? ${accountFilter}
      ORDER BY ipt.avg_engagement DESC
    `).all(...params)
  })

  ipcMain.handle('analytics:hashtags', async (_event, workspaceId: string, accountId?: string) => {
    const db = getDatabase()
    const accountFilter = accountId ? 'AND sa.id = ?' : ''
    const params = accountId ? [workspaceId, accountId] : [workspaceId]
    return db.prepare(`
      SELECT ihp.hashtag, ihp.avg_engagement, ihp.total_likes, ihp.post_count
      FROM instagram_hashtag_performance ihp
      JOIN social_accounts sa ON ihp.social_account_id = sa.id
      WHERE sa.workspace_id = ? ${accountFilter}
      ORDER BY ihp.avg_engagement DESC
      LIMIT 20
    `).all(...params)
  })
}
