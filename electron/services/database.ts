import { createRequire } from 'node:module'
import path from 'node:path'
import { app } from 'electron'

// better-sqlite3 is a native CJS addon — must be loaded via createRequire in ESM
const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')

export type DB = InstanceType<typeof Database>

let _db: DB | null = null

// ─── Init ─────────────────────────────────────────────────────────────────────

export function initDatabase(): DB {
  if (_db) return _db

  const dbPath = path.join(app.getPath('userData'), 'agentrix.db')
  const db = new Database(dbPath)

  // Performance & safety pragmas
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  db.pragma('synchronous = NORMAL')
  db.pragma('temp_store = MEMORY')
  db.pragma('mmap_size = 268435456') // 256 MB

  runMigrations(db)

  _db = db
  console.log(`[DB] Opened at ${dbPath}`)
  return db
}

export function getDatabase(): DB {
  if (!_db) throw new Error('Database not initialised — call initDatabase() first')
  return _db
}

export function closeDatabase(): void {
  if (_db) {
    _db.close()
    _db = null
    console.log('[DB] Closed')
  }
}

// ─── Migrations ───────────────────────────────────────────────────────────────

function runMigrations(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version   INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)

  const applied = db
    .prepare('SELECT version FROM schema_migrations')
    .all()
    .map((r: { version: number }) => r.version)

  const migrations: { version: number; up: string }[] = [
    { version: 1, up: migration_001_initial_schema },
    { version: 2, up: migration_002_ollama_config },
    { version: 3, up: migration_003_extended_analytics },
  ]

  for (const m of migrations) {
    if (!applied.includes(m.version)) {
      db.transaction(() => {
        db.exec(m.up)
        db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(m.version)
      })()
      console.log(`[DB] Applied migration v${m.version}`)
    }
  }
}

// ─── Migration 001 — Initial schema ──────────────────────────────────────────

const migration_001_initial_schema = `

-- Profiles (local user identity, no cloud auth)
CREATE TABLE IF NOT EXISTS profiles (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL CHECK(length(name) BETWEEN 2 AND 100),
  avatar_path TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Workspaces (scopes all content)
CREATE TABLE IF NOT EXISTS workspaces (
  id               TEXT PRIMARY KEY,
  profile_id       TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name             TEXT NOT NULL CHECK(length(name) BETWEEN 2 AND 50),
  timezone         TEXT NOT NULL DEFAULT 'UTC',
  default_language TEXT NOT NULL DEFAULT 'en',
  created_at       TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(profile_id, name)
);

-- Connected social accounts (tokens encrypted at rest)
CREATE TABLE IF NOT EXISTS social_accounts (
  id                   TEXT PRIMARY KEY,
  workspace_id         TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform             TEXT NOT NULL CHECK(platform IN ('instagram','tiktok','twitter','youtube','linkedin')),
  platform_user_id     TEXT NOT NULL,
  platform_username    TEXT NOT NULL,
  platform_display_name TEXT NOT NULL,
  avatar_url           TEXT,
  access_token         TEXT NOT NULL,   -- AES-256-GCM encrypted
  refresh_token        TEXT,            -- AES-256-GCM encrypted
  token_expires_at     TEXT,
  scopes               TEXT NOT NULL DEFAULT '[]',  -- JSON array
  is_active            INTEGER NOT NULL DEFAULT 1,
  last_synced_at       TEXT,
  connected_at         TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at           TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(workspace_id, platform, platform_user_id)
);

-- Posts (drafts + scheduled + published)
CREATE TABLE IF NOT EXISTS posts (
  id             TEXT PRIMARY KEY,
  workspace_id   TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  caption        TEXT NOT NULL DEFAULT '' CHECK(length(caption) <= 5000),
  hashtags       TEXT NOT NULL DEFAULT '[]',  -- JSON array
  cta_notes      TEXT,
  status         TEXT NOT NULL DEFAULT 'draft'
                   CHECK(status IN ('draft','scheduled','publishing','published','failed')),
  scheduled_at   TEXT,
  published_at   TEXT,
  failure_reason TEXT,
  retry_count    INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Per-platform publish targets for each post
CREATE TABLE IF NOT EXISTS post_platform_targets (
  id               TEXT PRIMARY KEY,
  post_id          TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  platform         TEXT NOT NULL CHECK(platform IN ('instagram','tiktok','twitter','youtube','linkedin')),
  social_account_id TEXT NOT NULL REFERENCES social_accounts(id),
  platform_post_id TEXT,
  permalink        TEXT,
  status           TEXT NOT NULL DEFAULT 'draft'
                     CHECK(status IN ('draft','scheduled','publishing','published','failed')),
  published_at     TEXT,
  failure_reason   TEXT
);

-- Media assets (local filesystem paths)
CREATE TABLE IF NOT EXISTS media_assets (
  id               TEXT PRIMARY KEY,
  workspace_id     TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  post_id          TEXT REFERENCES posts(id) ON DELETE SET NULL,
  local_path       TEXT NOT NULL,
  file_name        TEXT NOT NULL,
  mime_type        TEXT NOT NULL,
  file_size_bytes  INTEGER NOT NULL,
  width            INTEGER,
  height           INTEGER,
  duration_seconds REAL,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Competitors
CREATE TABLE IF NOT EXISTS competitors (
  id                TEXT PRIMARY KEY,
  workspace_id      TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  platform          TEXT NOT NULL CHECK(platform IN ('instagram','tiktok','twitter','youtube','linkedin')),
  platform_username TEXT NOT NULL,
  platform_user_id  TEXT,
  display_name      TEXT,
  avatar_url        TEXT,
  follower_count    INTEGER,
  last_synced_at    TEXT,
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(workspace_id, platform, platform_username)
);

-- Competitor posts (public data extracted via platform APIs)
CREATE TABLE IF NOT EXISTS competitor_posts (
  id               TEXT PRIMARY KEY,
  competitor_id    TEXT NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
  platform_post_id TEXT NOT NULL,
  caption          TEXT,
  hashtags         TEXT NOT NULL DEFAULT '[]',  -- JSON array
  media_type       TEXT NOT NULL CHECK(media_type IN ('image','video','carousel','reel')),
  likes            INTEGER NOT NULL DEFAULT 0,
  comments         INTEGER NOT NULL DEFAULT 0,
  shares           INTEGER NOT NULL DEFAULT 0,
  views            INTEGER,
  engagement_rate  REAL NOT NULL DEFAULT 0,
  posted_at        TEXT NOT NULL,
  fetched_at       TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(competitor_id, platform_post_id)
);

-- Post analytics (synced from platform APIs)
CREATE TABLE IF NOT EXISTS post_metrics (
  id                      TEXT PRIMARY KEY,
  post_platform_target_id TEXT NOT NULL REFERENCES post_platform_targets(id) ON DELETE CASCADE,
  impressions             INTEGER NOT NULL DEFAULT 0,
  reach                   INTEGER NOT NULL DEFAULT 0,
  likes                   INTEGER NOT NULL DEFAULT 0,
  comments                INTEGER NOT NULL DEFAULT 0,
  shares                  INTEGER NOT NULL DEFAULT 0,
  saves                   INTEGER NOT NULL DEFAULT 0,
  video_views             INTEGER,
  engagement_rate         REAL NOT NULL DEFAULT 0,
  fetched_at              TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Account-level metrics (daily snapshots)
CREATE TABLE IF NOT EXISTS account_metrics (
  id                  TEXT PRIMARY KEY,
  social_account_id   TEXT NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  follower_count      INTEGER NOT NULL DEFAULT 0,
  following_count     INTEGER NOT NULL DEFAULT 0,
  total_posts         INTEGER NOT NULL DEFAULT 0,
  avg_engagement_rate REAL NOT NULL DEFAULT 0,
  recorded_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

-- AI agent runs
CREATE TABLE IF NOT EXISTS agent_runs (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  agent_type      TEXT NOT NULL CHECK(agent_type IN ('analyzer','planner','creator')),
  input_snapshot  TEXT NOT NULL DEFAULT '{}',  -- JSON
  output_snapshot TEXT NOT NULL DEFAULT '{}',  -- JSON
  model_used      TEXT NOT NULL,
  duration_ms     INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'running'
                    CHECK(status IN ('running','completed','failed')),
  error_message   TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Content calendar slots (generated by Planner Agent)
CREATE TABLE IF NOT EXISTS calendar_slots (
  id                   TEXT PRIMARY KEY,
  workspace_id         TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  scheduled_at         TEXT NOT NULL,
  platform             TEXT NOT NULL CHECK(platform IN ('instagram','tiktok','twitter','youtube','linkedin')),
  topic                TEXT NOT NULL,
  content_type         TEXT NOT NULL CHECK(content_type IN ('post','reel','story','video','thread')),
  post_id              TEXT REFERENCES posts(id) ON DELETE SET NULL,
  created_by_agent_run_id TEXT REFERENCES agent_runs(id) ON DELETE SET NULL,
  created_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

-- In-app notifications
CREATE TABLE IF NOT EXISTS notifications (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type         TEXT NOT NULL,
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  metadata     TEXT NOT NULL DEFAULT '{}',  -- JSON
  is_read      INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_posts_workspace_status    ON posts(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at        ON posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_media_assets_workspace    ON media_assets(workspace_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_post         ON media_assets(post_id);
CREATE INDEX IF NOT EXISTS idx_competitor_posts_comp     ON competitor_posts(competitor_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_workspace      ON agent_runs(workspace_id, agent_type);
CREATE INDEX IF NOT EXISTS idx_notifications_workspace   ON notifications(workspace_id, is_read);
CREATE INDEX IF NOT EXISTS idx_calendar_slots_workspace  ON calendar_slots(workspace_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_post_metrics_target       ON post_metrics(post_platform_target_id);
CREATE INDEX IF NOT EXISTS idx_account_metrics_account   ON account_metrics(social_account_id, recorded_at);
`

// ─── Migration 002 — Ollama config table ──────────────────────────────────────

const migration_002_ollama_config = `

CREATE TABLE IF NOT EXISTS ollama_config (
  id            INTEGER PRIMARY KEY CHECK(id = 1),  -- singleton row
  base_url      TEXT NOT NULL DEFAULT 'http://localhost:11434',
  default_model TEXT NOT NULL DEFAULT 'llama3.2',
  timeout_ms    INTEGER NOT NULL DEFAULT 120000,
  max_tokens    INTEGER NOT NULL DEFAULT 2048,
  temperature   REAL NOT NULL DEFAULT 0.7,
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default config if not present
INSERT OR IGNORE INTO ollama_config (id) VALUES (1);
`

// ─── Migration 003 — Extended Instagram analytics tables ─────────────────────

const migration_003_extended_analytics = `

CREATE TABLE IF NOT EXISTS instagram_account_insights (
  id                TEXT PRIMARY KEY,
  social_account_id TEXT NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  reach             INTEGER NOT NULL DEFAULT 0,
  impressions       INTEGER NOT NULL DEFAULT 0,
  profile_views     INTEGER NOT NULL DEFAULT 0,
  website_clicks    INTEGER NOT NULL DEFAULT 0,
  recorded_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS instagram_audience_demographics (
  id                TEXT PRIMARY KEY,
  social_account_id TEXT NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  type              TEXT NOT NULL CHECK(type IN ('country','city','gender_age')),
  label             TEXT NOT NULL,
  value             INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS instagram_posting_times (
  id                TEXT PRIMARY KEY,
  social_account_id TEXT NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  hour              INTEGER NOT NULL,
  day_of_week       INTEGER NOT NULL,
  avg_engagement    REAL NOT NULL DEFAULT 0,
  post_count        INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS instagram_hashtag_performance (
  id                TEXT PRIMARY KEY,
  social_account_id TEXT NOT NULL REFERENCES social_accounts(id) ON DELETE CASCADE,
  hashtag           TEXT NOT NULL,
  avg_engagement    REAL NOT NULL DEFAULT 0,
  total_likes       INTEGER NOT NULL DEFAULT 0,
  post_count        INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_ig_insights_account    ON instagram_account_insights(social_account_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_ig_demo_account        ON instagram_audience_demographics(social_account_id, type);
CREATE INDEX IF NOT EXISTS idx_ig_times_account       ON instagram_posting_times(social_account_id);
CREATE INDEX IF NOT EXISTS idx_ig_hashtags_account    ON instagram_hashtag_performance(social_account_id, avg_engagement DESC);
`
