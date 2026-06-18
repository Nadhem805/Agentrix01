
import { ipcMain, BrowserWindow } from 'electron'
import {
  startInstagramOAuth,
  exchangeCodeForToken,
  fetchInstagramProfile,
  saveInstagramAccount,
} from '../services/instagramOAuth'
import {
  startTikTokOAuth,
  exchangeTikTokCode,
  fetchTikTokProfile,
  saveTikTokAccount,
} from '../services/tiktokOAuth'
import {
  startYouTubeOAuth,
  exchangeYouTubeCode,
  fetchYouTubeProfile,
  saveYouTubeAccount,
} from '../services/youtubeOAuth'
import { getDatabase } from '../services/database'

export function registerIntegrationHandlers(): void {

  // ── Instagram: open browser ────────────────────────────────────────────────
  ipcMain.handle('integration:connect:instagram', async () => {
    await startInstagramOAuth()
    return { opened: true }
  })

  // ── Instagram: exchange code ───────────────────────────────────────────────
  ipcMain.handle('integration:instagram:exchange-code', async (event, workspaceId: string, code: string) => {
    const tokenRes = await exchangeCodeForToken(code)
    const profile  = await fetchInstagramProfile(tokenRes.access_token)
    saveInstagramAccount(workspaceId, profile, tokenRes.access_token)
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.webContents.send('integration:connected', {
      platform: 'instagram', username: profile.username, displayName: profile.name, avatarUrl: profile.profile_picture_url,
    })
    return { success: true, username: profile.username, avatarUrl: profile.profile_picture_url }
  })

  // ── TikTok: open browser ───────────────────────────────────────────────────
  ipcMain.handle('integration:connect:tiktok', async () => {
    const verifier = await startTikTokOAuth()
    // Persist verifier in DB so it survives hot-reloads
    const db = getDatabase()
    db.prepare(`CREATE TABLE IF NOT EXISTS tiktok_pkce (id INTEGER PRIMARY KEY CHECK(id=1), verifier TEXT NOT NULL)`).run()
    db.prepare(`INSERT OR REPLACE INTO tiktok_pkce (id, verifier) VALUES (1, ?)`).run(verifier)
    console.log('[TikTok] Saved verifier length:', verifier.length)
    console.log('[TikTok] Saved verifier:', verifier)
    return { opened: true }
  })

  // ── TikTok: exchange code ──────────────────────────────────────────────────
  ipcMain.handle('integration:tiktok:exchange-code', async (event, workspaceId: string, rawCode: string) => {
    // Read verifier from DB
    const db = getDatabase()
    const row = db.prepare(`SELECT verifier FROM tiktok_pkce WHERE id = 1`).get() as any
    if (!row?.verifier) throw new Error('TikTok session expired — please click Connect again')
    const verifier = String(row.verifier).trim()

    console.log('[TikTok] Using verifier (first 20 chars):', verifier.substring(0, 20))
    console.log('[TikTok] Verifier length:', verifier.length)
    console.log('[TikTok] Full verifier:', verifier)

    // Extract code from full URL (same method as Instagram)
    let code = decodeURIComponent(rawCode).trim()
    if (code.includes('code=')) {
      try {
        const urlStr = code.includes('://') ? code : 'https://localhost?' + code.split('?')[1]
        const urlObj = new URL(urlStr)
        code = urlObj.searchParams.get('code') ?? code
      } catch {
        const match = code.match(/[?&]code=([^&#]+)/)
        if (match) code = match[1]
      }
    }
    // Strip fragment and any trailing params
    code = code.split('#')[0].split('&')[0].trim()
    console.log('[TikTok] Extracted code (first 20 chars):', code.substring(0, 20))
    const tokenRes = await exchangeTikTokCode(code, verifier)
    const profile  = await fetchTikTokProfile(tokenRes.access_token)
    saveTikTokAccount(workspaceId, profile, tokenRes)

    // Clean up verifier
    db.prepare(`DELETE FROM tiktok_pkce WHERE id = 1`).run()

    const win = BrowserWindow.fromWebContents(event.sender)
    win?.webContents.send('integration:connected', {
      platform: 'tiktok', username: profile.display_name, displayName: profile.display_name, avatarUrl: profile.avatar_url,
    })
    return { success: true, username: profile.display_name, avatarUrl: profile.avatar_url }
  })

  // ── YouTube: open browser ──────────────────────────────────────────────────
  ipcMain.handle('integration:connect:youtube', async () => {
    await startYouTubeOAuth()
    return { opened: true }
  })

  // ── YouTube: exchange code ─────────────────────────────────────────────────
  ipcMain.handle('integration:youtube:exchange-code', async (event, workspaceId: string, rawCode: string) => {
    let code = decodeURIComponent(rawCode).trim()
    if (code.includes('code=')) {
      try {
        const urlStr = code.includes('://') ? code : 'https://localhost?' + code.split('?')[1]
        const urlObj = new URL(urlStr)
        code = urlObj.searchParams.get('code') ?? code
      } catch {
        const match = code.match(/[?&]code=([^&#]+)/)
        if (match) code = match[1]
      }
    }
    code = code.split('#')[0].split('&')[0].trim()
    
    const tokenRes = await exchangeYouTubeCode(code)
    const profile  = await fetchYouTubeProfile(tokenRes.access_token)
    saveYouTubeAccount(workspaceId, profile, tokenRes)

    const win = BrowserWindow.fromWebContents(event.sender)
    win?.webContents.send('integration:connected', {
      platform: 'youtube', username: profile.display_name, displayName: profile.display_name, avatarUrl: profile.avatar_url,
    })
    return { success: true, username: profile.display_name, avatarUrl: profile.avatar_url }
  })

  // ── List connected accounts ────────────────────────────────────────────────
  ipcMain.handle('integration:list', async (_event, workspaceId: string) => {
    const db   = getDatabase()
    const rows = db.prepare(`
      SELECT id, platform, platform_username, platform_display_name,
             avatar_url, is_active, last_synced_at, connected_at, scopes, token_expires_at
      FROM social_accounts
      WHERE workspace_id = ?
      ORDER BY connected_at DESC
    `).all(workspaceId) as any[]
    return rows.map(r => ({
      ...r,
      scopes:   JSON.parse(r.scopes ?? '[]'),
      isActive: Boolean(r.is_active),
    }))
  })

  // ── Disconnect account ─────────────────────────────────────────────────────
  ipcMain.handle('integration:disconnect', async (_event, accountId: string) => {
    const db = getDatabase()
    db.transaction(() => {
      db.prepare(`DELETE FROM post_metrics WHERE post_platform_target_id IN (
        SELECT id FROM post_platform_targets WHERE social_account_id = ?
      )`).run(accountId)
      db.prepare('DELETE FROM post_platform_targets WHERE social_account_id = ?').run(accountId)
      db.prepare('DELETE FROM account_metrics WHERE social_account_id = ?').run(accountId)
      db.prepare('DELETE FROM social_accounts WHERE id = ?').run(accountId)
    })()
    return { success: true }
  })

  // ── Validate token ─────────────────────────────────────────────────────────
  ipcMain.handle('integration:validate', async (_event, accountId: string) => {
    const db      = getDatabase()
    const account = db.prepare('SELECT token_expires_at FROM social_accounts WHERE id = ?').get(accountId) as any
    if (!account) return { status: 'error', message: 'Account not found' }
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      return { status: 'expired' }
    }
    return { status: 'active' }
  })
}
