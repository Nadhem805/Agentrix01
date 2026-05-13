import { ipcMain, BrowserWindow } from 'electron'
import {
  startInstagramOAuth,
  exchangeCodeForToken,
  fetchInstagramProfile,
  saveInstagramAccount,
} from '../services/instagramOAuth'
import { getDatabase } from '../services/database'

export function registerIntegrationHandlers(): void {

  // ── Open Instagram OAuth in browser (returns immediately) ─────────────────
  ipcMain.handle('integration:connect:instagram', async (_event, _workspaceId: string) => {
    await startInstagramOAuth()
    // Returns immediately — UI will show code input for the user to paste
    return { opened: true }
  })

  // ── Exchange code that user pasted from browser URL ────────────────────────
  ipcMain.handle('integration:instagram:exchange-code', async (event, workspaceId: string, code: string) => {
    const tokenRes = await exchangeCodeForToken(code)
    const profile  = await fetchInstagramProfile(tokenRes.access_token)
    saveInstagramAccount(workspaceId, profile, tokenRes.access_token)

    const win = BrowserWindow.fromWebContents(event.sender)
    win?.webContents.send('integration:connected', {
      platform:    'instagram',
      username:    profile.username,
      displayName: profile.name,
    })

    return { success: true, username: profile.username }
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

    // Delete in correct order to respect foreign key constraints
    db.transaction(() => {
      // 1. Delete post metrics linked to this account's posts
      db.prepare(`
        DELETE FROM post_metrics WHERE post_platform_target_id IN (
          SELECT id FROM post_platform_targets WHERE social_account_id = ?
        )
      `).run(accountId)

      // 2. Delete post platform targets
      db.prepare('DELETE FROM post_platform_targets WHERE social_account_id = ?').run(accountId)

      // 3. Delete account metrics
      db.prepare('DELETE FROM account_metrics WHERE social_account_id = ?').run(accountId)

      // 4. Delete the account itself
      db.prepare('DELETE FROM social_accounts WHERE id = ?').run(accountId)
    })()

    return { success: true }
  })

  // ── Validate token ─────────────────────────────────────────────────────────
  ipcMain.handle('integration:validate', async (_event, accountId: string) => {
    const db      = getDatabase()
    const account = db
      .prepare('SELECT token_expires_at FROM social_accounts WHERE id = ?')
      .get(accountId) as any

    if (!account) return { status: 'error', message: 'Account not found' }
    if (account.token_expires_at && new Date(account.token_expires_at) < new Date()) {
      return { status: 'expired' }
    }
    return { status: 'active' }
  })
}
