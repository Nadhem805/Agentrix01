import { app } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { getDatabase } from './database'

export interface Profile {
  id: string
  name: string
  avatarPath?: string
  createdAt: Date
  updatedAt: Date
}

export interface Workspace {
  id: string
  profileId: string
  name: string
  timezone: string
  defaultLanguage: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateProfileData {
  name: string
  avatarPath?: string
}

export interface CreateWorkspaceData {
  name: string
  timezone: string
  defaultLanguage: string
}

// ─── Settings Store for Persistent Selections ───────────────────────────────

class SettingsStore {
  private filePath: string
  private data: Record<string, any> = {}

  constructor() {
    this.filePath = path.join(app.getPath('userData'), 'settings.json')
    this.load()
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8')
        this.data = JSON.parse(content)
      }
    } catch (e) {
      console.error('[SettingsStore] Failed to load settings:', e)
    }
  }

  private save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (e) {
      console.error('[SettingsStore] Failed to save settings:', e)
    }
  }

  get(key: string, defaultValue?: any): any {
    return this.data[key] ?? defaultValue
  }

  set(key: string, value: any): void {
    this.data[key] = value
    this.save()
  }
}

export const settingsStore = new SettingsStore()

// ─── Mapping Helpers ─────────────────────────────────────────────────────────

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    name: row.name,
    avatarPath: row.avatar_path || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

function mapWorkspace(row: any): Workspace {
  return {
    id: row.id,
    profileId: row.profile_id,
    name: row.name,
    timezone: row.timezone,
    defaultLanguage: row.default_language,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }
}

// ─── Profile Service Implementation ──────────────────────────────────────────

class ProfileServiceImpl {
  async getActiveProfile(): Promise<Profile | null> {
    const db = getDatabase()
    
    // Check if we have an active profile stored in settings.json
    const storedProfileId = settingsStore.get('activeProfileId')
    if (storedProfileId) {
      const row = db.prepare('SELECT * FROM profiles WHERE id = ?').get(storedProfileId)
      if (row) return mapProfile(row)
    }

    // Fallback: get the first profile in the database
    const row = db.prepare('SELECT * FROM profiles ORDER BY created_at ASC LIMIT 1').get()
    if (row) {
      const profile = mapProfile(row)
      settingsStore.set('activeProfileId', profile.id)
      return profile
    }

    return null
  }

  async createProfile(data: CreateProfileData & { defaultWorkspaceName?: string }): Promise<Profile> {
    const db = getDatabase()
    const profileId = crypto.randomUUID()
    const now = new Date().toISOString()

    db.transaction(() => {
      db.prepare(`
        INSERT INTO profiles (id, name, avatar_path, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(profileId, data.name, data.avatarPath || null, now, now)

      // Create default workspace for this new profile
      const workspaceId = crypto.randomUUID()
      const workspaceName = data.defaultWorkspaceName || 'My Workspace'
      db.prepare(`
        INSERT INTO workspaces (id, profile_id, name, timezone, default_language, created_at, updated_at)
        VALUES (?, ?, ?, 'UTC', 'en', ?, ?)
      `).run(workspaceId, profileId, workspaceName, now, now)

      // Auto-set as active selections
      settingsStore.set('activeProfileId', profileId)
      settingsStore.set('activeWorkspaceId', workspaceId)
    })()

    const row = db.prepare('SELECT * FROM profiles WHERE id = ?').get(profileId)
    return mapProfile(row)
  }

  async updateProfile(id: string, data: Partial<CreateProfileData>): Promise<Profile> {
    const db = getDatabase()
    const now = new Date().toISOString()

    const fields: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      fields.push('name = ?')
      values.push(data.name)
    }
    if (data.avatarPath !== undefined) {
      fields.push('avatar_path = ?')
      values.push(data.avatarPath || null)
    }

    if (fields.length > 0) {
      fields.push('updated_at = ?')
      values.push(now)
      values.push(id)

      db.prepare(`
        UPDATE profiles SET ${fields.join(', ')} WHERE id = ?
      `).run(...values)
    }

    const row = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id)
    return mapProfile(row)
  }

  async listWorkspaces(profileId: string): Promise<Workspace[]> {
    const db = getDatabase()
    const rows = db.prepare('SELECT * FROM workspaces WHERE profile_id = ? ORDER BY created_at ASC').all(profileId)
    return rows.map(mapWorkspace)
  }

  async createWorkspace(data: CreateWorkspaceData & { profileId?: string }): Promise<Workspace> {
    const db = getDatabase()
    const workspaceId = crypto.randomUUID()
    const now = new Date().toISOString()
    
    // Resolve profile context
    const profileId = data.profileId || settingsStore.get('activeProfileId')
    if (!profileId) throw new Error('No active profile context for workspace creation')

    db.prepare(`
      INSERT INTO workspaces (id, profile_id, name, timezone, default_language, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(workspaceId, profileId, data.name, data.timezone || 'UTC', data.defaultLanguage || 'en', now, now)

    // Set as active workspace
    settingsStore.set('activeWorkspaceId', workspaceId)

    const row = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(workspaceId)
    return mapWorkspace(row)
  }

  async switchWorkspace(id: string): Promise<void> {
    const db = getDatabase()
    const row = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(id)
    if (!row) throw new Error(`Workspace with ID ${id} not found`)
    
    settingsStore.set('activeWorkspaceId', id)
    settingsStore.set('activeProfileId', row.profile_id)
  }

  getActiveWorkspace(): Workspace | null {
    const db = getDatabase()
    const storedWorkspaceId = settingsStore.get('activeWorkspaceId')
    
    if (storedWorkspaceId) {
      const row = db.prepare('SELECT * FROM workspaces WHERE id = ?').get(storedWorkspaceId)
      if (row) return mapWorkspace(row)
    }

    // Fallback: get first workspace of active profile
    const activeProfileId = settingsStore.get('activeProfileId')
    if (activeProfileId) {
      const row = db.prepare('SELECT * FROM workspaces WHERE profile_id = ? ORDER BY created_at ASC LIMIT 1').get(activeProfileId)
      if (row) {
        const ws = mapWorkspace(row)
        settingsStore.set('activeWorkspaceId', ws.id)
        return ws
      }
    }

    return null
  }
}

export const profileService = new ProfileServiceImpl()
