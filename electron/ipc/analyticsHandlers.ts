import type { IpcMain } from 'electron'
import { getDatabase } from '../services/database'
import { syncInstagramAnalytics } from '../services/instagramAnalytics'

export function registerAnalyticsHandlers(ipcMain: IpcMain) {

  // ── Sync analytics for all connected Instagram accounts ───────────────────
  ipcMain.handle('analytics:sync', async (_event, workspaceId: string) => {
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
    console.log('[Analytics] Syncing for workspace:', workspaceId)

    const accounts = db.prepare(
      `SELECT id, platform_username FROM social_accounts WHERE workspace_id = ? AND platform = 'instagram' AND is_active = 1`
    ).all(workspaceId) as { id: string; platform_username: string }[]

    console.log('[Analytics] Found accounts:', accounts.length, accounts.map(a => a.platform_username))

    if (accounts.length === 0) {
      // Try without workspace filter — in case workspace_id mismatch
      const allAccounts = db.prepare(
        `SELECT id, platform_username, workspace_id FROM social_accounts WHERE platform = 'instagram' AND is_active = 1`
      ).all() as { id: string; platform_username: string; workspace_id: string }[]
      console.log('[Analytics] All Instagram accounts in DB:', allAccounts)
    }

    const results = []
    for (const account of accounts) {
      try {
        const result = await syncInstagramAnalytics(account.id)
        results.push(result)
      } catch (e: any) {
        console.error('[Analytics] Sync error for account', account.id, ':', e.message)
        results.push({ accountId: account.id, error: e.message })
      }
    }
    return results
  })

  // ── Overview stats ─────────────────────────────────────────────────────────
  ipcMain.handle('analytics:overview', async (_event, workspaceId: string, accountId?: string) => {
    const db = getDatabase()

    // Debug logging
    const debugPostsCount = (db.prepare(`SELECT COUNT(*) as count FROM posts WHERE workspace_id = ?`).get(workspaceId) as any)?.count ?? 0
    const debugMetricsCount = (db.prepare(`SELECT COUNT(*) as count FROM post_metrics`).get() as any)?.count ?? 0
    const debugSample = db.prepare(`SELECT id, status, workspace_id FROM posts LIMIT 3`).all()
    console.log('[Analytics] overview debug — workspace:', workspaceId, 'posts:', debugPostsCount, 'metrics:', debugMetricsCount)
    console.log('[Analytics] sample posts:', debugSample)

    const totalPosts = debugPostsCount

    const accountFilter = accountId ? 'AND ppt.social_account_id = ?' : ''
    const params = accountId ? [workspaceId, accountId] : [workspaceId]
    const paramsWithTwo = accountId ? [workspaceId, accountId] : [workspaceId]

    const engagements = (db.prepare(`
      SELECT COALESCE(SUM(pm.likes + pm.comments + pm.shares + pm.saves), 0) as total
      FROM post_metrics pm
      JOIN post_platform_targets ppt ON pm.post_platform_target_id = ppt.id
      JOIN posts p ON ppt.post_id = p.id
      WHERE p.workspace_id = ? ${accountFilter}
    `).get(...params) as any)?.total ?? 0

    const avgEngagement = (db.prepare(`
      SELECT COALESCE(AVG(pm.engagement_rate), 0) as avg
      FROM post_metrics pm
      JOIN post_platform_targets ppt ON pm.post_platform_target_id = ppt.id
      JOIN posts p ON ppt.post_id = p.id
      WHERE p.workspace_id = ? ${accountFilter}
    `).get(...paramsWithTwo) as any)?.avg ?? 0

    const latestFollowers = (db.prepare(`
      SELECT follower_count FROM account_metrics am
      JOIN social_accounts sa ON am.social_account_id = sa.id
      WHERE sa.workspace_id = ? ${accountId ? 'AND sa.id = ?' : ''}
      ORDER BY am.recorded_at DESC LIMIT 1
    `).get(...paramsWithTwo) as any)?.follower_count ?? 0

    const impressions = (db.prepare(`
      SELECT COALESCE(SUM(pm.impressions), 0) as total
      FROM post_metrics pm
      JOIN post_platform_targets ppt ON pm.post_platform_target_id = ppt.id
      JOIN posts p ON ppt.post_id = p.id
      WHERE p.workspace_id = ? ${accountFilter}
    `).get(...paramsWithTwo) as any)?.total ?? 0

    return {
      totalPosts,
      totalEngagements: engagements,
      avgEngagementRate: parseFloat(avgEngagement.toFixed(2)),
      followerCount: latestFollowers,
      impressions,
    }
  })

  // ── Top posts ──────────────────────────────────────────────────────────────
  ipcMain.handle('analytics:top-posts', async (_event, workspaceId: string, limit = 10, accountId?: string) => {
    const db = getDatabase()
    const accountFilter = accountId ? 'AND ppt.social_account_id = ?' : ''
    const params = accountId ? [workspaceId, accountId, limit] : [workspaceId, limit]
    return db.prepare(`
      SELECT
        p.id, p.caption, ppt.platform, ppt.permalink,
        pm.likes, pm.comments, pm.shares, pm.saves,
        pm.impressions, pm.reach, pm.video_views,
        pm.engagement_rate, p.published_at
      FROM post_metrics pm
      JOIN post_platform_targets ppt ON pm.post_platform_target_id = ppt.id
      JOIN posts p ON ppt.post_id = p.id
      WHERE p.workspace_id = ? ${accountFilter}
      ORDER BY pm.engagement_rate DESC
      LIMIT ?
    `).all(...params)
  })

  // ── Engagement trend (last 30 days) ───────────────────────────────────────
  ipcMain.handle('analytics:trend', async (_event, workspaceId: string, accountId?: string) => {
    const db = getDatabase()
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
        AND p.published_at >= datetime('now', '-365 days')
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
      SELECT am.follower_count, am.total_posts, am.recorded_at, sa.platform
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
