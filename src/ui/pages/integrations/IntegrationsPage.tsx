import { useState, useEffect, useCallback } from 'react'
import { useProfileStore } from '@/stores/profileStore'
import {
  Store,
  CheckCircle2,
  AlertCircle,
  Clock,
  RefreshCw,
  Unlink,
  ExternalLink,
  ShieldCheck,
  Zap,
  Loader2,
} from 'lucide-react'

// ─── Social platform SVG icons ────────────────────────────────────────────────

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const TwitterIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const YoutubeIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const LinkedinIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
  </svg>
)

// ─── Types ────────────────────────────────────────────────────────────────────

type SocialPlatform = 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'linkedin'
type ConnectionStatus = 'active' | 'expired' | 'revoked' | 'disconnected'

interface SocialAccount {
  id: string
  platform: SocialPlatform
  platformUsername: string
  platformDisplayName: string
  avatarInitial: string
  avatarColor: string
  avatarUrl?: string
  status: ConnectionStatus
  scopes: string[]
  connectedAt: string
  lastSyncedAt?: string
  tokenExpiresAt?: string
}

// ─── Platform color map (used for avatar colors) ─────────────────────────────

const platformConfig: Record<SocialPlatform, { color: string }> = {
  instagram: { color: '#E4405F' },
  tiktok:    { color: '#69C9D0' },
  twitter:   { color: '#1DA1F2' },
  youtube:   { color: '#FF0000' },
  linkedin:  { color: '#0A66C2' },
}

// ─── Platform config ──────────────────────────────────────────────────────────

interface PlatformDef {
  label: string
  color: string
  Icon: React.ElementType
  description: string
  features: string[]
}

const platforms: Record<SocialPlatform, PlatformDef> = {
  instagram: {
    label: 'Instagram',
    color: '#E4405F',
    Icon: InstagramIcon,
    description: 'Publish posts, reels, and stories. Sync engagement metrics.',
    features: ['Post & Reel publishing', 'Story scheduling', 'Insights sync', 'Competitor tracking'],
  },
  tiktok: {
    label: 'TikTok',
    color: '#69C9D0',
    Icon: TikTokIcon,
    description: 'Upload videos and sync TikTok performance data.',
    features: ['Video publishing', 'Caption & hashtags', 'View & engagement sync', 'Competitor tracking'],
  },
  twitter: {
    label: 'Twitter / X',
    color: '#1DA1F2',
    Icon: TwitterIcon,
    description: 'Post tweets and threads. Track impressions and engagement.',
    features: ['Tweet & thread posting', 'Impression tracking', 'Engagement sync', 'Competitor tracking'],
  },
  youtube: {
    label: 'YouTube',
    color: '#FF0000',
    Icon: YoutubeIcon,
    description: 'Upload videos and sync YouTube analytics.',
    features: ['Video upload', 'Description & tags', 'View & subscriber sync', 'Competitor tracking'],
  },
  linkedin: {
    label: 'LinkedIn',
    color: '#0A66C2',
    Icon: LinkedinIcon,
    description: 'Publish professional posts and articles. Sync reach metrics.',
    features: ['Post publishing', 'Article scheduling', 'Reach & impression sync', 'Competitor tracking'],
  },
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: ConnectionStatus }) {
  const config = {
    active:       { label: 'Active',       color: 'var(--success)', bg: 'rgba(34,197,94,0.12)',   Icon: CheckCircle2 },
    expired:      { label: 'Token Expired', color: 'var(--warning)', bg: 'rgba(245,158,11,0.12)', Icon: Clock },
    revoked:      { label: 'Revoked',       color: 'var(--danger)',  bg: 'rgba(239,68,68,0.12)',  Icon: AlertCircle },
    disconnected: { label: 'Disconnected',  color: 'var(--text-muted)', bg: 'var(--bg-hover)',    Icon: AlertCircle },
  }[status]

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{ backgroundColor: config.bg, color: config.color }}
    >
      <config.Icon size={11} />
      {config.label}
    </span>
  )
}

// ─── Connected account card ───────────────────────────────────────────────────

function ConnectedAccountCard({ account, onDisconnect }: { account: SocialAccount; onDisconnect: () => void }) {
  const { label, color, Icon } = platforms[account.platform]

  return (
    <div
      className="rounded-2xl p-5 transition-all"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: avatar + info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {account.avatarUrl ? (
              <img
                src={account.avatarUrl}
                alt={account.platformDisplayName}
                className="h-11 w-11 rounded-full object-cover"
                referrerPolicy="no-referrer"
                style={{ border: `1.5px solid ${color}` }}
              />
            ) : (
              <div
                className="flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: account.avatarColor }}
              >
                {account.avatarInitial}
              </div>
            )}
            <div
              className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full"
              style={{ backgroundColor: color, color: '#fff' }}
            >
              <Icon size={11} />
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {account.platformDisplayName}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {account.platformUsername} · {label}
            </p>
          </div>
        </div>

        {/* Right: status + actions */}
        <div className="flex items-center gap-2">
          <StatusBadge status={account.status} />
          {account.status === 'expired' && (
            <button
              className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              <RefreshCw size={11} />
              Reconnect
            </button>
          )}
          <button
            onClick={onDisconnect}
            className="rounded-xl p-1.5 transition-all hover:opacity-80"
            style={{ backgroundColor: 'rgba(239,68,68,0.10)', color: 'var(--danger)' }}
            title="Disconnect"
          >
            <Unlink size={13} />
          </button>
        </div>
      </div>

      {/* Meta row */}
      <div
        className="mt-4 flex flex-wrap items-center gap-4 border-t pt-4 text-xs"
        style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
      >
        <span>Connected {account.connectedAt}</span>
        {account.lastSyncedAt && <span>Last synced {account.lastSyncedAt}</span>}
        {account.tokenExpiresAt && (
          <span style={{ color: account.status === 'expired' ? 'var(--warning)' : 'inherit' }}>
            Token expires {account.tokenExpiresAt}
          </span>
        )}
      </div>

      {/* Scopes */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {account.scopes.map((scope) => (
          <span
            key={scope}
            className="rounded-md px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}
          >
            {scope}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Platform tile ────────────────────────────────────────────────────────────

function PlatformTile({
  def,
  connected,
  connecting,
  onConnect,
}: {
  platform: SocialPlatform
  def: PlatformDef
  connected: boolean
  connecting: boolean
  onConnect: () => void
}) {
  const { label, color, Icon, description, features } = def

  return (
    <div
      className="flex flex-col rounded-2xl p-5 transition-all"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}22`, color }}
          >
            <Icon size={20} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {label}
            </p>
            {connected && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold"
                style={{ color: 'var(--success)' }}
              >
                <CheckCircle2 size={10} />
                Connected
              </span>
            )}
          </div>
        </div>

        {connected ? (
          <button
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: 'var(--bg-hover)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            <ExternalLink size={11} />
            Manage
          </button>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90 glow-primary disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            {connecting
              ? <Loader2 size={11} className="animate-spin" />
              : <Zap size={11} />}
            {connecting ? 'Connecting...' : 'Connect'}
          </button>
        )}
      </div>

      {/* Description */}
      <p className="mt-3 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {description}
      </p>

      {/* Features */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {features.map((f) => (
          <span
            key={f}
            className="rounded-md px-2 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: `${color}14`, color }}
          >
            {f}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── IPC bridge ───────────────────────────────────────────────────────────────

interface IpcBridge {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
  on: (channel: string, listener: (...args: unknown[]) => void) => void
  off: (channel: string, listener: (...args: unknown[]) => void) => void
}

// Helper to safely call IPC (works in Electron, no-ops in browser)
const ipc: IpcBridge = (window as any).ipcRenderer ?? {
  invoke: async () => [],
  on: () => {},
  off: () => {},
}

// WORKSPACE_ID replaced dynamically by useProfileStore activeWorkspace

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const { activeWorkspace } = useProfileStore()
  const workspaceId = activeWorkspace?.id ?? 'default-workspace'
  const [activeTab, setActiveTab]         = useState<'connected' | 'available'>('connected')
  const [accounts, setAccounts]           = useState<SocialAccount[]>([])
  const [connecting, setConnecting]       = useState<SocialPlatform | null>(null)
  const [connectError, setConnectError]   = useState<string | null>(null)
  const [showCodeInput, setShowCodeInput] = useState(false)
  const [codeInput, setCodeInput]         = useState('')

  // Load connected accounts from DB on mount
  const loadAccounts = useCallback(async () => {
    try {
      const rows = await ipc.invoke('integration:list', workspaceId) as any[]
      const mapped: SocialAccount[] = rows.map(r => ({
        id:                  r.id,
        platform:            r.platform as SocialPlatform,
        platformUsername:    r.platform_username,
        platformDisplayName: r.platform_display_name,
        avatarInitial:       (r.platform_display_name ?? r.platform_username ?? '?')[0].toUpperCase(),
        avatarColor:         platformConfig[r.platform as SocialPlatform]?.color ?? '#888',
        avatarUrl:           r.avatar_url,
        status:              'active' as const,
        scopes:              r.scopes ?? [],
        connectedAt:         r.connected_at,
        lastSyncedAt:        r.last_synced_at,
        tokenExpiresAt:      r.token_expires_at,
      }))
      setAccounts(mapped)
    } catch (err) {
      console.error('Failed to load accounts:', err)
    }
  }, [workspaceId])

  useEffect(() => {
    loadAccounts()

    // Listen for real-time connection events
    const handler = () => { loadAccounts() }
    ipc.on('integration:connected', handler)
    return () => { ipc.off('integration:connected', handler) }
  }, [loadAccounts])

  const handleConnect = async (platform: SocialPlatform) => {
    if (platform !== 'instagram' && platform !== 'tiktok' && platform !== 'youtube') {
      setConnectError(`${platform} integration coming soon.`)
      setTimeout(() => setConnectError(null), 3000)
      return
    }

    if (platform === 'tiktok') {
      setConnecting(null)
      setConnectError(null)
      try {
        await ipc.invoke('integration:connect:tiktok', workspaceId)
      } catch (err: any) {
        setConnectError(err.message ?? 'Failed to open TikTok')
        return
      }
      setShowCodeInput(true)
      return
    }

    if (platform === 'youtube') {
      setConnecting(null)
      setConnectError(null)
      try {
        await ipc.invoke('integration:connect:youtube', workspaceId)
      } catch (err: any) {
        setConnectError(err.message ?? 'Failed to open YouTube')
        return
      }
      setShowCodeInput(true)
      return
    }

    // Instagram flow
    setConnectError(null)
    try {
      await ipc.invoke('integration:connect:instagram', workspaceId)
    } catch (err: any) {
      setConnectError(err.message ?? 'Failed to open browser')
      return
    }
    setShowCodeInput(true)
  }

  const handleSubmitCode = async () => {
    let code = codeInput.trim()
    if (!code) return

    // Detect platform from connecting state or URL content
    const isTikTok = connecting === 'tiktok' || code.includes('tiktok') || code.includes('scopes=')
    const isYouTube = connecting === 'youtube' || code.includes('youtube') || code.includes('google')

    // Extract code from full URL if pasted
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

    // Strip fragment and decode
    code = decodeURIComponent(code.split('#')[0].split('&')[0].trim())

    const platform = isTikTok ? 'tiktok' : isYouTube ? 'youtube' : 'instagram'
    setConnecting(platform as SocialPlatform)
    setConnectError(null)

    try {
      if (isTikTok) {
        await ipc.invoke('integration:tiktok:exchange-code', workspaceId, code)
      } else if (isYouTube) {
        await ipc.invoke('integration:youtube:exchange-code', workspaceId, code)
      } else {
        await ipc.invoke('integration:instagram:exchange-code', workspaceId, code)
      }
      await loadAccounts()
      setShowCodeInput(false)
      setCodeInput('')
      setActiveTab('connected')
    } catch (err: any) {
      setConnectError(err.message ?? 'Failed to exchange code')
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnect = async (accountId: string) => {
    try {
      await ipc.invoke('integration:disconnect', accountId)
      await loadAccounts()
    } catch (err) {
      console.error('Disconnect failed:', err)
    }
  }

  const connectedPlatforms = new Set(accounts.map(a => a.platform))

  const tabs = [
    { id: 'connected' as const,  label: 'Connected Accounts', count: accounts.length },
    { id: 'available' as const,  label: 'Available Platforms', count: Object.keys(platforms).length },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Store size={20} style={{ color: 'var(--primary)' }} />
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
              Integrations
            </h1>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Connect your social media accounts to publish content and sync analytics.
          </p>
        </div>
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs"
          style={{ backgroundColor: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: 'var(--success)' }}
        >
          <ShieldCheck size={13} />
          Tokens encrypted with AES-256-GCM
        </div>
      </div>

      {/* Error banner */}
      {connectError && (
        <div
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)' }}
        >
          <AlertCircle size={15} />
          {connectError}
        </div>
      )}

      {/* Manual code input modal */}
      {showCodeInput && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ backgroundColor: 'rgba(108,59,255,0.08)', border: '1px solid rgba(108,59,255,0.3)' }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Paste the code from your browser
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              After approving, your browser showed an error page. Copy the full URL from the address bar and paste it below.
            </p>
            <p className="mt-1 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              Paste the full URL: <strong style={{ color: '#A084FF' }}>https://localhost:8765/oauth/tiktok?code=...</strong> or <strong style={{ color: '#A084FF' }}>https://localhost:8765/oauth/youtube?code=...</strong>
            </p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={codeInput}
              onChange={e => {
                setCodeInput(e.target.value)
                // Auto-submit for TikTok (codes expire in 10s) when full URL is pasted
                if (e.target.value.includes('code=') && (e.target.value.includes('scopes=') || e.target.value.includes('tiktok'))) {
                  setTimeout(() => document.getElementById('code-submit-btn')?.click(), 150)
                }
              }}
              placeholder="Paste the full URL here..."
              className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text)' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
            <button
              id="code-submit-btn"
              onClick={handleSubmitCode}
              disabled={!codeInput.trim() || !!connecting}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 glow-primary"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              {connecting ? <Loader2 size={14} className="animate-spin" /> : null}
              Connect
            </button>
            <button
              onClick={() => { setShowCodeInput(false); setCodeInput('') }}
              className="rounded-xl px-4 py-2.5 text-sm font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--bg-hover)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text)' : 'var(--text-muted)',
            }}
          >
            {tab.label}
            <span
              className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: activeTab === tab.id ? 'rgba(108,59,255,0.18)' : 'var(--bg-hover)',
                color: activeTab === tab.id ? '#A084FF' : 'var(--text-muted)',
              }}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'connected' ? (
        <div className="space-y-4">
          {accounts.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center rounded-2xl py-20"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <Store size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
              <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                No accounts connected yet
              </p>
              <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                Go to "Available Platforms" to connect your first account.
              </p>
              <button
                onClick={() => setActiveTab('available')}
                className="mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 glow-primary"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
              >
                Browse Platforms
              </button>
            </div>
          ) : (
            <>
              {accounts.some(a => a.status === 'expired') && (
                <div
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
                  style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: 'var(--warning)' }}
                >
                  <AlertCircle size={15} />
                  One or more accounts have expired tokens. Reconnect them to resume publishing.
                </div>
              )}
              {accounts.map(account => (
                <ConnectedAccountCard
                  key={account.id}
                  account={account}
                  onDisconnect={() => handleDisconnect(account.id)}
                />
              ))}
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {(Object.entries(platforms) as [SocialPlatform, PlatformDef][]).map(([key, def]) => (
            <PlatformTile
              key={key}
              platform={key}
              def={def}
              connected={connectedPlatforms.has(key)}
              connecting={connecting === key}
              onConnect={() => handleConnect(key)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
