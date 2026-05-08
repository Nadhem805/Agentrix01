// SQLite database module — better-sqlite3
// All tables are created here on first launch

// TODO: install better-sqlite3 in Phase 2
// import Database from 'better-sqlite3'
// import path from 'node:path'
// import { app } from 'electron'

// export function initDatabase(): Database.Database {
//   const dbPath = path.join(app.getPath('userData'), 'agentrix.db')
//   const db = new Database(dbPath)
//   db.pragma('journal_mode = WAL')
//   db.pragma('foreign_keys = ON')
//   runMigrations(db)
//   return db
// }

// Schema tables:
// profiles, workspaces, social_accounts, posts, post_platform_targets,
// media_assets, analytics, account_metrics, agent_runs, calendar_slots,
// competitors, competitor_posts, notifications, ollama_config

export const DB_SCHEMA_VERSION = 1
