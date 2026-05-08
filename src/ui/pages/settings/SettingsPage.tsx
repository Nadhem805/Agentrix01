
import { useState } from 'react'
import {
  Settings,
  User,
  Bot,
  Bell,
  Shield,
  Database,
  Palette,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Globe,
  Clock,
  Zap,
  HardDrive,
  Info,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type Section =
  | 'profile'
  | 'ai-models'
  | 'notifications'
  | 'privacy'
  | 'data'
  | 'appearance'
  | 'about'

// ─── Sidebar nav ──────────────────────────────────────────────────────────────

const navItems: { id: Section; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'profile',       label: 'Profile',       icon: User,     description: 'Name, workspace, timezone'     },
  { id: 'ai-models',     label: 'AI Models',     icon: Bot,      description: 'Ollama config, model selection' },
  { id: 'notifications', label: 'Notifications', icon: Bell,     description: 'Alerts and reminders'           },
  { id: 'privacy',       label: 'Privacy',       icon: Shield,   description: 'Data handling and security'     },
  { id: 'data',          label: 'Data & Storage', icon: Database, description: 'Export, backup, clear cache'   },
  { id: 'appearance',    label: 'Appearance',    icon: Palette,  description: 'Theme and display options'      },
  { id: 'about',         label: 'About',         icon: Info,     description: 'Version and system info'        },
]

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>{title}</h2>
      <p className="mt-0.5 text-sm" style={{ color: 'var(--text-muted)' }}>{description}</p>
    </div>
  )
}

function SettingRow({
  label,
  description,
  children,
  danger,
}: {
  label: string
  description?: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <div
      className="flex items-center justify-between gap-6 rounded-xl px-4 py-3.5"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="min-w-0">
        <p className="text-sm font-medium" style={{ color: danger ? 'var(--danger)' : 'var(--text)' }}>
          {label}
        </p>
        {description && (
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative h-5 w-9 rounded-full transition-all duration-200"
      style={{ backgroundColor: value ? 'var(--primary)' : 'var(--bg-hover)' }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200"
        style={{ left: value ? '18px' : '2px' }}
      />
    </button>
  )
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="rounded-xl px-3 py-2 text-sm outline-none transition-all"
      style={{
        backgroundColor: 'var(--bg-hover)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        minWidth: 160,
      }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="rounded-xl px-3 py-2 text-sm outline-none transition-all"
      style={{
        backgroundColor: 'var(--bg-hover)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        minWidth: 200,
      }}
      onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    />
  )
}

function DangerButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:opacity-90"
      style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.25)' }}
    >
      {label}
    </button>
  )
}

function ActionButton({ label, icon: Icon, onClick }: { label: string; icon: React.ElementType; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
      style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
    >
      <Icon size={14} />
      {label}
    </button>
  )
}

// ─── Profile section ──────────────────────────────────────────────────────────

function ProfileSection() {
  const [name, setName] = useState('Nadhem')
  const [workspace, setWorkspace] = useState('My Workspace')
  const [timezone, setTimezone] = useState('Europe/Berlin')
  const [language, setLanguage] = useState('en')
  const [saved, setSaved] = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const timezones = [
    { value: 'UTC',             label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago',  label: 'Central Time (CT)' },
    { value: 'America/Denver',   label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London',    label: 'London (GMT)' },
    { value: 'Europe/Berlin',    label: 'Berlin (CET)' },
    { value: 'Europe/Paris',     label: 'Paris (CET)' },
    { value: 'Asia/Tokyo',       label: 'Tokyo (JST)' },
    { value: 'Asia/Dubai',       label: 'Dubai (GST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  ]

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'es', label: 'Spanish' },
    { value: 'ar', label: 'Arabic' },
  ]

  return (
    <div>
      <SectionHeader title="Profile" description="Manage your local profile and workspace settings." />

      {/* Avatar */}
      <div className="mb-6 flex items-center gap-4">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{name}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Local profile — no cloud sync</p>
          <button className="mt-1 text-xs transition-all hover:opacity-80" style={{ color: 'var(--primary)' }}>
            Change avatar
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <SettingRow label="Display Name" description="Your name shown across the app">
          <TextInput value={name} onChange={setName} placeholder="Your name" />
        </SettingRow>
        <SettingRow label="Workspace Name" description="Name for your active workspace">
          <TextInput value={workspace} onChange={setWorkspace} placeholder="Workspace name" />
        </SettingRow>
        <SettingRow label="Timezone" description="Used for scheduling and calendar display">
          <div className="flex items-center gap-2">
            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
            <Select value={timezone} options={timezones} onChange={setTimezone} />
          </div>
        </SettingRow>
        <SettingRow label="Language" description="Interface language">
          <div className="flex items-center gap-2">
            <Globe size={14} style={{ color: 'var(--text-muted)' }} />
            <Select value={language} options={languages} onChange={setLanguage} />
          </div>
        </SettingRow>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={save}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 glow-primary"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
        >
          {saved ? <CheckCircle2 size={14} /> : null}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

// ─── AI Models section ────────────────────────────────────────────────────────

function AIModelsSection() {
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434')
  const [defaultModel, setDefaultModel] = useState('llama3.2')
  const [temperature, setTemperature] = useState('0.7')
  const [maxTokens, setMaxTokens] = useState('2048')
  const [timeout, setTimeout_] = useState('120')
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle')

  const checkHealth = () => {
    setStatus('checking')
    // Simulate health check
    setTimeout(() => setStatus('ok'), 1200)
  }

  const models = [
    { value: 'llama3.2',   label: 'llama3.2 (recommended)' },
    { value: 'llama3.1',   label: 'llama3.1' },
    { value: 'mistral',    label: 'mistral' },
    { value: 'codellama',  label: 'codellama' },
    { value: 'phi3',       label: 'phi3' },
    { value: 'gemma2',     label: 'gemma2' },
  ]

  const statusConfig = {
    idle:     { label: 'Not checked',  color: 'var(--text-muted)', bg: 'var(--bg-hover)',           Icon: null },
    checking: { label: 'Checking...',  color: 'var(--warning)',    bg: 'rgba(245,158,11,0.12)',      Icon: RefreshCw },
    ok:       { label: 'Connected',    color: 'var(--success)',    bg: 'rgba(34,197,94,0.12)',       Icon: CheckCircle2 },
    error:    { label: 'Unreachable',  color: 'var(--danger)',     bg: 'rgba(239,68,68,0.12)',       Icon: AlertCircle },
  }[status]

  return (
    <div>
      <SectionHeader title="AI Models" description="Configure your local Ollama server and model preferences." />

      {/* Ollama status banner */}
      <div
        className="mb-5 flex items-center justify-between rounded-xl px-4 py-3"
        style={{ backgroundColor: statusConfig.bg, border: `1px solid ${statusConfig.color}40` }}
      >
        <div className="flex items-center gap-2">
          {statusConfig.Icon && (
            <statusConfig.Icon
              size={15}
              style={{ color: statusConfig.color, animation: status === 'checking' ? 'spin 1s linear infinite' : 'none' }}
            />
          )}
          <span className="text-sm font-medium" style={{ color: statusConfig.color }}>
            Ollama — {statusConfig.label}
          </span>
          {status === 'ok' && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>v0.3.12</span>
          )}
        </div>
        <button
          onClick={checkHealth}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <RefreshCw size={11} />
          Check
        </button>
      </div>

      <div className="space-y-3">
        <SettingRow label="Ollama Base URL" description="Local server endpoint">
          <TextInput value={ollamaUrl} onChange={setOllamaUrl} placeholder="http://localhost:11434" />
        </SettingRow>
        <SettingRow label="Default Model" description="Model used for all agent runs">
          <Select value={defaultModel} options={models} onChange={setDefaultModel} />
        </SettingRow>
        <SettingRow label="Temperature" description="Creativity level (0.0 = precise, 1.0 = creative)">
          <div className="flex items-center gap-3">
            <input
              type="range" min="0" max="1" step="0.1"
              value={temperature}
              onChange={e => setTemperature(e.target.value)}
              className="w-28 accent-[var(--primary)]"
            />
            <span className="w-8 text-right text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {temperature}
            </span>
          </div>
        </SettingRow>
        <SettingRow label="Max Tokens" description="Maximum output length per generation">
          <Select
            value={maxTokens}
            options={[
              { value: '512',  label: '512 tokens' },
              { value: '1024', label: '1024 tokens' },
              { value: '2048', label: '2048 tokens (default)' },
              { value: '4096', label: '4096 tokens' },
            ]}
            onChange={setMaxTokens}
          />
        </SettingRow>
        <SettingRow label="Request Timeout" description="Seconds before a generation request times out">
          <Select
            value={timeout}
            options={[
              { value: '60',  label: '60 seconds' },
              { value: '120', label: '120 seconds (default)' },
              { value: '180', label: '180 seconds' },
              { value: '300', label: '5 minutes' },
            ]}
            onChange={setTimeout_}
          />
        </SettingRow>
      </div>

      {/* Available models */}
      <div className="mt-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Installed Models
        </p>
        <div className="space-y-2">
          {[
            { name: 'llama3.2', size: '2.0 GB', active: true },
            { name: 'mistral',  size: '4.1 GB', active: false },
          ].map(m => (
            <div key={m.name}
              className="flex items-center justify-between rounded-xl px-4 py-3"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: 'rgba(108,59,255,0.15)', color: 'var(--primary)' }}>
                  <Zap size={14} />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{m.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{m.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {m.active && (
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                    style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: 'var(--success)' }}>
                    Active
                  </span>
                )}
                <button className="rounded-lg p-1.5 transition-all hover:opacity-80"
                  style={{ backgroundColor: 'rgba(239,68,68,0.10)', color: 'var(--danger)' }}>
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>
            <Download size={14} />
            Pull a new model
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Notifications section ────────────────────────────────────────────────────

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    postPublished:     true,
    postFailed:        true,
    postScheduled:     false,
    agentCompleted:    true,
    agentFailed:       true,
    syncCompleted:     false,
    accountDisconnect: true,
    ollamaUnavailable: true,
    desktopEnabled:    true,
    soundEnabled:      false,
  })

  const set = (key: keyof typeof prefs) => (v: boolean) =>
    setPrefs(prev => ({ ...prev, [key]: v }))

  return (
    <div>
      <SectionHeader title="Notifications" description="Choose which events trigger alerts." />

      <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Delivery
      </p>
      <div className="mb-5 space-y-3">
        <SettingRow label="Desktop Notifications" description="Show OS-level notifications">
          <Toggle value={prefs.desktopEnabled} onChange={set('desktopEnabled')} />
        </SettingRow>
        <SettingRow label="Sound Alerts" description="Play a sound for important events">
          <Toggle value={prefs.soundEnabled} onChange={set('soundEnabled')} />
        </SettingRow>
      </div>

      <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Event Types
      </p>
      <div className="space-y-3">
        {[
          { key: 'postPublished',     label: 'Post Published',          desc: 'When a scheduled post goes live' },
          { key: 'postFailed',        label: 'Post Failed',             desc: 'When publishing fails' },
          { key: 'postScheduled',     label: 'Post Scheduled',          desc: 'When a post is added to the queue' },
          { key: 'agentCompleted',    label: 'Agent Completed',         desc: 'When an AI agent finishes a run' },
          { key: 'agentFailed',       label: 'Agent Failed',            desc: 'When an agent run errors out' },
          { key: 'syncCompleted',     label: 'Analytics Synced',        desc: 'When metrics are refreshed' },
          { key: 'accountDisconnect', label: 'Account Disconnected',    desc: 'When a platform token is revoked' },
          { key: 'ollamaUnavailable', label: 'Ollama Unavailable',      desc: 'When the local AI server is unreachable' },
        ].map(item => (
          <SettingRow key={item.key} label={item.label} description={item.desc}>
            <Toggle
              value={prefs[item.key as keyof typeof prefs] as boolean}
              onChange={set(item.key as keyof typeof prefs)}
            />
          </SettingRow>
        ))}
      </div>
    </div>
  )
}

// ─── Privacy section ──────────────────────────────────────────────────────────

function PrivacySection() {
  const [showToken, setShowToken] = useState(false)
  const [autoLock, setAutoLock] = useState(true)
  const [lockTimeout, setLockTimeout] = useState('15')
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false)

  return (
    <div>
      <SectionHeader title="Privacy & Security" description="Control how your data is stored and protected." />

      <div className="mb-5 space-y-3">
        <SettingRow
          label="Token Encryption"
          description="All OAuth tokens are encrypted with AES-256-GCM before being stored in SQLite"
        >
          <span className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: 'var(--success)' }}>
            <CheckCircle2 size={11} />
            Always on
          </span>
        </SettingRow>

        <SettingRow
          label="Encryption Key Preview"
          description="Your local encryption key (never transmitted)"
        >
          <div className="flex items-center gap-2">
            <code className="rounded-lg px-3 py-1.5 text-xs font-mono"
              style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
              {showToken ? 'agx_key_7f3a9b2c1d4e8f6a' : '••••••••••••••••••'}
            </code>
            <button onClick={() => setShowToken(v => !v)}
              className="rounded-lg p-1.5 transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}>
              {showToken ? <EyeOff size={13} /> : <Eye size={13} />}
            </button>
          </div>
        </SettingRow>

        <SettingRow label="Auto-lock Workspace" description="Lock after inactivity">
          <Toggle value={autoLock} onChange={setAutoLock} />
        </SettingRow>

        {autoLock && (
          <SettingRow label="Lock Timeout" description="Minutes of inactivity before locking">
            <Select
              value={lockTimeout}
              options={[
                { value: '5',  label: '5 minutes' },
                { value: '15', label: '15 minutes' },
                { value: '30', label: '30 minutes' },
                { value: '60', label: '1 hour' },
              ]}
              onChange={setLockTimeout}
            />
          </SettingRow>
        )}

        <SettingRow
          label="Anonymous Analytics"
          description="Share anonymous usage data to help improve Agentrix (no personal data)"
        >
          <Toggle value={analyticsOptIn} onChange={setAnalyticsOptIn} />
        </SettingRow>
      </div>

      <div
        className="rounded-xl p-4 text-sm"
        style={{ backgroundColor: 'rgba(108,59,255,0.06)', border: '1px solid rgba(108,59,255,0.2)', color: 'var(--text-muted)' }}
      >
        Agentrix is fully offline-first. Your posts, analytics, and AI outputs never leave your machine. OAuth tokens are the only data that touches external servers, and only to authenticate with social platforms.
      </div>
    </div>
  )
}

// ─── Data & Storage section ───────────────────────────────────────────────────

function DataSection() {
  const [confirmClear, setConfirmClear] = useState<string | null>(null)

  const storageItems = [
    { label: 'SQLite Database',  size: '14.2 MB', icon: Database },
    { label: 'Media Assets',     size: '238 MB',  icon: HardDrive },
    { label: 'Agent Run Logs',   size: '3.8 MB',  icon: Bot },
    { label: 'Analytics Cache',  size: '1.1 MB',  icon: HardDrive },
  ]

  return (
    <div>
      <SectionHeader title="Data & Storage" description="Export your data, manage storage, and clear caches." />

      {/* Storage breakdown */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Storage Usage
      </p>
      <div className="mb-6 space-y-2">
        {storageItems.map(item => (
          <div key={item.label}
            className="flex items-center justify-between rounded-xl px-4 py-3"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ backgroundColor: 'rgba(59,169,255,0.12)', color: 'var(--secondary)' }}>
                <item.icon size={14} />
              </div>
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.label}</span>
            </div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>{item.size}</span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ backgroundColor: 'rgba(108,59,255,0.06)', border: '1px solid rgba(108,59,255,0.2)' }}>
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Total</span>
          <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>257.1 MB</span>
        </div>
      </div>

      {/* Export */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Export
      </p>
      <div className="mb-6 space-y-3">
        <SettingRow label="Export All Data" description="Download a full JSON backup of your workspace">
          <ActionButton label="Export JSON" icon={Download} onClick={() => {}} />
        </SettingRow>
        <SettingRow label="Export Analytics" description="Download analytics as CSV">
          <ActionButton label="Export CSV" icon={Download} onClick={() => {}} />
        </SettingRow>
        <SettingRow label="Export Posts" description="Download all post drafts and published content">
          <ActionButton label="Export Posts" icon={Download} onClick={() => {}} />
        </SettingRow>
      </div>

      {/* Danger zone */}
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--danger)' }}>
        Danger Zone
      </p>
      <div className="space-y-3">
        {[
          { key: 'cache',    label: 'Clear Analytics Cache',  desc: 'Removes cached metrics. Data will re-sync on next refresh.' },
          { key: 'logs',     label: 'Clear Agent Run Logs',   desc: 'Deletes all stored agent run history.' },
          { key: 'media',    label: 'Clear Unused Media',     desc: 'Removes media files not linked to any post.' },
          { key: 'all',      label: 'Reset All Data',         desc: 'Permanently deletes all posts, analytics, and settings. Cannot be undone.' },
        ].map(item => (
          <div key={item.key}>
            <SettingRow label={item.label} description={item.desc} danger={item.key === 'all'}>
              {confirmClear === item.key ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Are you sure?</span>
                  <button
                    onClick={() => setConfirmClear(null)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
                    style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    Cancel
                  </button>
                  <button
                    onClick={() => setConfirmClear(null)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-90"
                    style={{ backgroundColor: 'var(--danger)', color: '#fff' }}>
                    Confirm
                  </button>
                </div>
              ) : (
                <DangerButton label="Clear" onClick={() => setConfirmClear(item.key)} />
              )}
            </SettingRow>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Appearance section ───────────────────────────────────────────────────────

function AppearanceSection() {
  const [accentColor, setAccentColor] = useState('#6C3BFF')
  const [fontSize, setFontSize] = useState('md')
  const [sidebarCompact, setSidebarCompact] = useState(false)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  const accents = [
    { color: '#6C3BFF', label: 'Violet (default)' },
    { color: '#3BA9FF', label: 'Blue' },
    { color: '#A84FFF', label: 'Purple' },
    { color: '#22C55E', label: 'Green' },
    { color: '#F59E0B', label: 'Amber' },
    { color: '#E4405F', label: 'Rose' },
  ]

  return (
    <div>
      <SectionHeader title="Appearance" description="Customize the look and feel of Agentrix." />

      <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
        Accent Color
      </p>
      <div className="mb-6 flex flex-wrap gap-3">
        {accents.map(a => (
          <button
            key={a.color}
            onClick={() => setAccentColor(a.color)}
            title={a.label}
            className="relative h-8 w-8 rounded-full transition-all hover:scale-110"
            style={{ backgroundColor: a.color }}
          >
            {accentColor === a.color && (
              <span className="absolute inset-0 flex items-center justify-center">
                <CheckCircle2 size={14} color="#fff" />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <SettingRow label="Font Size" description="Base text size across the app">
          <Select
            value={fontSize}
            options={[
              { value: 'sm', label: 'Small' },
              { value: 'md', label: 'Medium (default)' },
              { value: 'lg', label: 'Large' },
            ]}
            onChange={setFontSize}
          />
        </SettingRow>
        <SettingRow label="Compact Sidebar" description="Reduce sidebar padding and icon sizes">
          <Toggle value={sidebarCompact} onChange={setSidebarCompact} />
        </SettingRow>
        <SettingRow label="Animations" description="Enable transitions and motion effects">
          <Toggle value={animationsEnabled} onChange={setAnimationsEnabled} />
        </SettingRow>
      </div>

      <div className="mt-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Theme
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'dark',  label: 'Dark (default)', bg: '#0E0E12', surface: '#16161C' },
            { id: 'darker', label: 'Darker',        bg: '#080810', surface: '#0E0E18' },
          ].map(theme => (
            <button
              key={theme.id}
              className="flex items-center gap-3 rounded-xl p-3 text-left transition-all"
              style={{
                backgroundColor: theme.id === 'dark' ? 'rgba(108,59,255,0.10)' : 'var(--bg-card)',
                border: `1px solid ${theme.id === 'dark' ? 'var(--primary)' : 'var(--border)'}`,
              }}
            >
              <div className="h-8 w-8 rounded-lg" style={{ backgroundColor: theme.bg, border: '1px solid #2A2A38' }} />
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{theme.label}</p>
                {theme.id === 'dark' && (
                  <p className="text-[10px]" style={{ color: 'var(--primary)' }}>Active</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── About section ────────────────────────────────────────────────────────────

function AboutSection() {
  const info = [
    { label: 'Version',          value: '0.0.0' },
    { label: 'Electron',         value: '33.x' },
    { label: 'React',            value: '18.x' },
    { label: 'Database',         value: 'SQLite (better-sqlite3)' },
    { label: 'AI Runtime',       value: 'Ollama (local)' },
    { label: 'Platform',         value: 'Windows' },
  ]

  return (
    <div>
      <SectionHeader title="About Agentrix" description="Version info and system details." />

      {/* Logo card */}
      <div
        className="mb-6 flex items-center gap-4 rounded-2xl p-5"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl font-bold text-white animate-pulse-glow"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
        >
          A
        </div>
        <div>
          <p className="gradient-text text-lg font-bold">Agentrix</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Content OS — Powered by local AI</p>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>Version 0.0.0</p>
        </div>
      </div>

      {/* System info */}
      <div className="mb-6 overflow-hidden rounded-2xl" style={{ border: '1px solid var(--border)' }}>
        {info.map((item, i) => (
          <div
            key={item.label}
            className="flex items-center justify-between px-4 py-3"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderBottom: i < info.length - 1 ? '1px solid var(--border)' : 'none',
            }}
          >
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.value}</span>
          </div>
        ))}
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'View on GitHub',      href: '#' },
          { label: 'Report a Bug',        href: '#' },
          { label: 'Release Notes',       href: '#' },
          { label: 'Open Data Directory', href: '#' },
        ].map(link => (
          <button
            key={link.label}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            {link.label}
            <ChevronRight size={13} />
          </button>
        ))}
      </div>

      <p className="mt-6 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
        Built with Electron, React, TypeScript, TailwindCSS, and Ollama.
        All data stays on your machine.
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [active, setActive] = useState<Section>('profile')

  const sectionMap: Record<Section, React.ReactNode> = {
    'profile':       <ProfileSection />,
    'ai-models':     <AIModelsSection />,
    'notifications': <NotificationsSection />,
    'privacy':       <PrivacySection />,
    'data':          <DataSection />,
    'appearance':    <AppearanceSection />,
    'about':         <AboutSection />,
  }

  return (
    <div className="flex h-full gap-6 animate-fade-in">
      {/* ── Left nav ── */}
      <aside className="w-56 shrink-0">
        <div className="flex items-center gap-2 mb-5">
          <Settings size={18} style={{ color: 'var(--primary)' }} />
          <h1 className="text-base font-bold" style={{ color: 'var(--text)' }}>Settings</h1>
        </div>
        <nav className="space-y-0.5">
          {navItems.map(item => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition-all"
                style={{
                  backgroundColor: isActive ? 'rgba(108,59,255,0.12)' : 'transparent',
                  color: isActive ? '#A084FF' : 'var(--text-muted)',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text)' } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' } }}
              >
                <item.icon size={16} style={{ color: isActive ? 'var(--primary)' : 'inherit', flexShrink: 0 }} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* ── Content ── */}
      <div className="min-w-0 flex-1 overflow-y-auto">
        <div className="max-w-2xl">
          {sectionMap[active]}
        </div>
      </div>
    </div>
  )
}
