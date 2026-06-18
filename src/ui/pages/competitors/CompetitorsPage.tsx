import { useEffect, useState } from 'react'
import {
  UserSearch,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  TrendingUp,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  Search,
} from 'lucide-react'
import { useCompetitorStore } from '../../stores/competitorStore'
import { useProfileStore } from '../../stores/profileStore'
import type { Competitor, CompetitorPost } from '@/types/competitor'

// ─── Social platform SVG icons ────────────────────────────────────────────────

const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const TwitterIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const YoutubeIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
)

const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
)

const TikTokIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
  </svg>
)

// ─── Types ────────────────────────────────────────────────────────────────────

type SocialPlatform = 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'linkedin'

// ─── Platform config ──────────────────────────────────────────────────────────

const platformConfig: Record<SocialPlatform, { label: string; color: string; Icon: React.ElementType; supportsRSS: boolean; supportsRealSync: boolean }> = {
  instagram: { label: 'Instagram', color: '#E4405F', Icon: InstagramIcon, supportsRSS: false, supportsRealSync: true },
  tiktok:    { label: 'TikTok',    color: '#69C9D0', Icon: TikTokIcon, supportsRSS: false, supportsRealSync: false },
  twitter:   { label: 'Twitter/X', color: '#1DA1F2', Icon: TwitterIcon, supportsRSS: false, supportsRealSync: false },
  youtube:   { label: 'YouTube',   color: '#FF0000', Icon: YoutubeIcon, supportsRSS: true, supportsRealSync: true },
  linkedin:  { label: 'LinkedIn',  color: '#0A66C2', Icon: LinkedinIcon, supportsRSS: false, supportsRealSync: false },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}


// ─── Add Competitor Modal ─────────────────────────────────────────────────────

function AddCompetitorModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (platform: SocialPlatform, username: string) => Promise<void>
}) {
  const [platform, setPlatform] = useState<SocialPlatform>('youtube')
  const [username, setUsername] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!username.trim()) return
    setIsSubmitting(true)
    setError(null)
    try {
      await onAdd(platform, username.trim())
      onClose()
    } catch (e: any) {
      console.error(e)
      setError(e.message || 'Failed to add competitor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-md animate-fade-in rounded-2xl p-6"
        style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
      >
        <h2 className="mb-1 text-base font-semibold" style={{ color: 'var(--text)' }}>
          Add Competitor
        </h2>
        <p className="mb-5 text-sm" style={{ color: 'var(--text-muted)' }}>
          Track a competitor's public posts and engagement metrics.
        </p>

        {/* Platform selector */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Platform
          </label>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(platformConfig) as SocialPlatform[]).map((p) => {
              const { label, color, Icon, supportsRSS, supportsRealSync } = platformConfig[p]
              const selected = platform === p
              const badgeText = supportsRSS ? 'RSS' : supportsRealSync ? 'Live' : null
              return (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  title={badgeText ? `${label} (${badgeText})` : label}
                  disabled={isSubmitting}
                  className="relative flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-medium transition-all"
                  style={{
                    backgroundColor: selected ? `${color}22` : 'var(--bg-card)',
                    border: `1px solid ${selected ? color : 'var(--border)'}`,
                    color: selected ? color : 'var(--text-muted)',
                  }}
                >
                  <Icon size={16} />
                  {badgeText && (
                    <span className="absolute -top-1 -right-1 text-[8px] font-bold px-1 rounded-full" style={{ backgroundColor: color, color: 'white' }}>
                      {badgeText}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Username/URL input */}
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            {platform === 'youtube' ? 'Channel URL or Channel ID' : 'Username or Profile URL'}
          </label>
          <div className="relative">
            {platform !== 'youtube' && (
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'var(--text-muted)' }}
              >
                @
              </span>
            )}
            <input
              type="text"
              value={username}
              disabled={isSubmitting}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={
                platform === 'youtube'
                  ? 'e.g. https://youtube.com/@channel or UCXXXXXX'
                  : platform === 'instagram'
                  ? 'e.g. https://instagram.com/nike or @nike'
                  : 'e.g. username or https://instagram.com/username'
              }
              className="w-full rounded-xl py-2.5 pl-7 pr-4 text-sm outline-none transition-all"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
            />
          </div>
        </div>

        {/* YouTube info note */}
        {platform === 'youtube' && (
          <div className="mb-4 rounded-lg p-3 text-xs" style={{ backgroundColor: 'rgba(255,0,0,0.08)', border: '1px solid rgba(255,0,0,0.2)' }}>
            <p style={{ color: '#FF0000' }} className="font-medium mb-1">✨ No authentication needed!</p>
            <p style={{ color: 'var(--text-muted)' }}>
              YouTube channels have free public RSS feeds. Just enter the channel URL or ID and we'll fetch their latest videos.
            </p>
          </div>
        )}

        {/* Instagram info note */}
        {platform === 'instagram' && (
          <div className="mb-4 rounded-lg p-3 text-xs" style={{ backgroundColor: 'rgba(228,64,95,0.08)', border: '1px solid rgba(228,64,95,0.2)' }}>
            <p style={{ color: '#E4405F' }} className="font-medium mb-1">✨ Public profile sync!</p>
            <p style={{ color: 'var(--text-muted)' }}>
              We'll fetch the real display name, avatar, and follower count from Instagram's public page.
            </p>
          </div>
        )}

        {error && (
          <p className="mb-4 text-xs font-semibold" style={{ color: 'var(--danger)' }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all hover:opacity-80"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!username.trim() || isSubmitting}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 glow-primary flex items-center justify-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            {isSubmitting && <RefreshCw size={14} className="animate-spin" />}
            {isSubmitting ? 'Adding...' : 'Add Competitor'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Competitor Card ──────────────────────────────────────────────────────────

function CompetitorCard({
  competitor,
  selected,
  onClick,
  onRemove,
  onSync,
  isSyncing,
}: {
  competitor: Competitor
  selected: boolean
  onClick: () => void
  onRemove: () => void
  onSync: () => void
  isSyncing: boolean
}) {
  const { label, color, Icon, supportsRSS, supportsRealSync } = platformConfig[competitor.platform];
const displayName = competitor.displayName || competitor.platformUsername;
const avatarUrl = competitor.avatarUrl;
const avatarColor = competitor.avatarColor || '#6C3BFF';
const avatarInitial = competitor.avatarInitial || 'C';
const badgeText = supportsRSS ? 'RSS' : supportsRealSync ? 'Live' : null;

  return (
    <div
      onClick={onClick}
      className="w-full cursor-pointer rounded-2xl p-4 text-left transition-all hover:scale-[1.01]"
      style={{
        backgroundColor: selected ? 'rgba(108,59,255,0.10)' : 'var(--bg-card)',
        border: `1px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden bg-white border border-gray-300">
          {avatarUrl ? (
            <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-white" style={{ backgroundColor: avatarColor, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {avatarInitial}
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {displayName}
            </p>
            <span
              className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: `${color}22`, color }}
            >
              <Icon size={10} />
              {label}
            </span>
            {badgeText && (
              <span className="text-[8px] font-bold px-1 rounded-full" style={{ backgroundColor: color, color: 'white' }}>
                {badgeText}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            @{competitor.platformUsername}
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                {formatNumber(competitor.followerCount || 0)}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Followers
              </p>
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--success)' }}>
                {competitor.avgEngagementRate || 0}%
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Avg. Eng.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                {competitor.postCount || 0}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Posts
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Synced {competitor.lastSyncedAt || 'Never'}
        </p>
        <div className="flex gap-1.5">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onSync()
            }}
            disabled={isSyncing}
            className="rounded-lg p-1.5 transition-all hover:opacity-80 disabled:opacity-50"
            style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}
            title="Sync now"
          >
            <RefreshCw size={11} className={isSyncing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="rounded-lg p-1.5 transition-all hover:opacity-80"
            style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: 'var(--danger)' }}
            title="Remove"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Post Row ─────────────────────────────────────────────────────────────────

function PostRow({ post, platform }: { post: CompetitorPost; platform?: SocialPlatform }) {
  const mediaTypeColors: Record<string, string> = {
    image:    'var(--secondary)',
    video:    '#A84FFF',
    carousel: 'var(--warning)',
    reel:     '#E4405F',
  }

  return (
    <div
      className="group flex items-start gap-4 rounded-xl p-4 transition-all hover:scale-[1.005]"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
    >
      {/* Media type badge */}
      <div
        className="mt-0.5 shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold uppercase"
        style={{
          backgroundColor: `${mediaTypeColors[post.mediaType]}22`,
          color: mediaTypeColors[post.mediaType],
        }}
      >
        {post.mediaType}
      </div>

      {/* Caption/Title */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm" style={{ color: 'var(--text)' }}>
          {post.caption || (platform === 'youtube' ? 'Untitled Video' : 'No caption')}
        </p>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          {post.postedAt}
        </p>
      </div>

      {/* Metrics */}
      <div className="flex shrink-0 items-center gap-4">
        {post.views !== undefined && (
          <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            <Eye size={12} />
            {formatNumber(post.views)}
          </div>
        )}
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Heart size={12} />
          {formatNumber(post.likes)}
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <MessageCircle size={12} />
          {formatNumber(post.comments)}
        </div>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Share2 size={12} />
          {formatNumber(post.shares)}
        </div>
        <div
          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: 'var(--success)' }}
        >
          <TrendingUp size={11} />
          {post.engagementRate}%
        </div>
        <a
          href={post.permalink}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 transition-all"
          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}
          title="Open post"
        >
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompetitorsPage() {
  const [showModal, setShowModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const activeWorkspace = useProfileStore((state) => state.activeWorkspace)
  const {
    competitors,
    competitorPosts,
    isLoading,
    isSyncing,
    fetchCompetitors,
    addCompetitor,
    removeCompetitor,
    syncCompetitor,
    getCompetitorPosts,
  } = useCompetitorStore()

  // 1. Fetch competitors for the active workspace
  useEffect(() => {
    if (activeWorkspace) {
      fetchCompetitors(activeWorkspace.id)
    }
  }, [activeWorkspace, fetchCompetitors])

  // 2. Manage selected competitor state & auto-select the first one
  useEffect(() => {
    if (competitors.length > 0) {
      if (!selectedId || !competitors.some((c) => c.id === selectedId)) {
        setSelectedId(competitors[0].id)
      }
    } else {
      setSelectedId(null)
    }
  }, [competitors, selectedId])

  // 3. Fetch posts whenever selected competitor changes
  useEffect(() => {
    if (selectedId) {
      getCompetitorPosts(selectedId)
    }
  }, [selectedId, getCompetitorPosts])

  const selected = competitors.find((c) => c.id === selectedId)
  const posts = selectedId ? (competitorPosts[selectedId] || []) : []

  const filtered = competitors.filter(
    (c) =>
      (c.displayName || c.platformUsername).toLowerCase().includes(search.toLowerCase()) ||
      c.platformUsername.toLowerCase().includes(search.toLowerCase())
  )

  // Helper to resolve YouTube channel ID from a handle by scraping the channel page
  const resolveYouTubeChannelId = async (handle: string): Promise<string | undefined> => {
    try {
      const response = await fetch(`https://www.youtube.com/@${handle}`);
      const html = await response.text();
      const match = html.match(/"channelId":"(UC[\\w-]{22})"/);
      return match ? match[1] : undefined;
    } catch (e) {
      console.error('Failed to resolve YouTube channel ID:', e);
      return undefined;
    }
  };

  const handleAdd = async (platform: SocialPlatform, input: string) => {
    if (!activeWorkspace) return;
    let username = input.trim();
    let channelId: string | undefined;

    // Attempt to parse as URL
    try {
      const url = new URL(username);
      const pathParts = url.pathname.split('/').filter(Boolean);
      switch (platform) {
        case 'youtube':
          // Support @username, /channel/ID, /c/ID, /user/username, or video URLs
          if (pathParts.length) {
            const first = pathParts[0];
            if (first.startsWith('@')) {
              username = first.slice(1);
              // Resolve handle to channel ID if possible
              channelId = await resolveYouTubeChannelId(username);
            } else if (first === 'channel' && pathParts[1]) {
              channelId = pathParts[1];
              username = channelId;
            } else if (first === 'c' && pathParts[1]) {
              username = pathParts[1];
            } else if (first === 'user' && pathParts[1]) {
              username = pathParts[1];
            } else if (url.searchParams.has('v')) {
              // Reject video URLs
              throw new Error('Please provide the channel URL, not a video URL');
            }
          } else if (username.match(/^UC[\w-]{22}$/i)) {
            // Already a channel ID
            channelId = username;
          }
          break;
        case 'tiktok': {
          const tiktokPart = pathParts.find(p => p.startsWith('@')) || pathParts[0];
          if (tiktokPart) {
            username = tiktokPart.replace(/^@/, '').replace(/\/$/, '').trim();
          }
          break;
        }
        case 'instagram':
          if (pathParts.length) {
            const first = pathParts[0];
            if (first !== 'p' && first !== 'reel' && first !== 'stories' && first !== 'tv' && first !== 'explore') {
              username = first;
            }
          }
          break;
        case 'twitter':
          if (pathParts.length) username = pathParts[0].replace(/^@/, '');
          break;
        case 'linkedin':
          if (pathParts.length >= 2) username = pathParts[1];
          break;
        default:
          break;
      }
    } catch {
      // Not a URL – keep original input
    }

    // Sanitize username
    username = decodeURIComponent(username)
      .replace(/^@/, '')
      .replace(/\/+$/, '')
      .split('?')[0]
      .trim()
      .replace(/\s+/g, '');

    // For YouTube, prefer resolved channel ID, otherwise fall back to handle/username
    const finalUsername = channelId || username;

    const created = await addCompetitor(activeWorkspace.id, platform, finalUsername);
    setSelectedId(created.id);
    // If YouTube and we used a handle (no channelId), try to resolve and sync
    if (platform === 'youtube' && !channelId) {
      const resolvedId = await resolveYouTubeChannelId(finalUsername);
      if (resolvedId) {
        // Update competitor with proper channel ID by re-syncing
        await syncCompetitor(created.id);
      }
    }
  };

  const handleRemove = async (id: string) => {
    if (confirm('Are you sure you want to remove this competitor? This will clear all synced posts.')) {
      await removeCompetitor(id)
    }
  }

  const handleSync = async (id: string) => {
    await syncCompetitor(id)
  }

  const selectedPlatform = selected?.platform

  return (
    <div className="flex h-full gap-6 animate-fade-in">
      {/* ── Left panel: competitor list ── */}
      <div className="flex w-80 shrink-0 flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserSearch size={18} style={{ color: 'var(--primary)' }} />
            <h1 className="text-base font-bold" style={{ color: 'var(--text)' }}>
              Competitors
            </h1>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: 'rgba(108,59,255,0.18)', color: '#A084FF' }}
            >
              {competitors.length}
            </span>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white transition-all hover:opacity-90 glow-primary"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            <Plus size={13} />
            Add
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search competitors…"
            className="w-full rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none transition-all"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
          />
        </div>

        {/* List */}
        <div className="flex flex-col gap-3 overflow-y-auto">
          {isLoading && competitors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              <RefreshCw size={18} className="animate-spin" />
              <span>Loading competitors...</span>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No competitors found.
            </p>
          ) : (
            filtered.map((c) => (
              <CompetitorCard
                key={c.id}
                competitor={c}
                selected={selectedId === c.id}
                onClick={() => setSelectedId(c.id)}
                onRemove={() => handleRemove(c.id)}
                onSync={() => handleSync(c.id)}
                isSyncing={isSyncing === c.id}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Right panel: posts ── */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        {selected ? (
          <>
            {/* Competitor header */}
            <div
              className="flex items-center justify-between rounded-2xl p-5"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full overflow-hidden bg-white border border-gray-300">
                  {selected.avatarUrl ? (
                    <img src={selected.avatarUrl} alt={selected.displayName || selected.platformUsername} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-base font-bold text-white" style={{ backgroundColor: selected.avatarColor || '#6C3BFF', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {selected.avatarInitial || 'C'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-base font-bold" style={{ color: 'var(--text)' }}>
                    {selected.displayName || selected.platformUsername}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    @{selected.platformUsername} · {platformConfig[selected.platform].label}
                    {platformConfig[selected.platform].supportsRSS && ' (RSS Feed)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                    {formatNumber(selected.followerCount || 0)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {selected.platform === 'youtube' ? 'Subscribers' : 'Followers'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold" style={{ color: 'var(--success)' }}>
                    {selected.avgEngagementRate || 0}%
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Avg. Engagement
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                    {selected.postCount || 0}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {selected.platform === 'youtube' ? 'Videos' : 'Posts'}
                  </p>
                </div>
                <button
                  onClick={() => handleSync(selected.id)}
                  disabled={isSyncing === selected.id}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <RefreshCw size={14} className={isSyncing === selected.id ? 'animate-spin' : ''} />
                  {isSyncing === selected.id ? 'Syncing...' : `Sync ${selected.platform === 'youtube' ? 'Videos' : 'Posts'}`}
                </button>
              </div>
            </div>

            {/* Posts list */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {selected.platform === 'youtube' ? 'Recent Videos' : 'Top Posts'}
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {posts.length} {selected.platform === 'youtube' ? 'videos' : 'posts'} tracked
                </p>
              </div>

              {posts.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center rounded-2xl py-16"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <UserSearch size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                  <p className="mt-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    No {selected.platform === 'youtube' ? 'videos' : 'posts'} synced yet
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                    Click "Sync {selected.platform === 'youtube' ? 'Videos' : 'Posts'}" to fetch the latest content.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {posts.map((post) => (
                    <PostRow key={post.id} post={post} platform={selectedPlatform} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div
            className="flex flex-1 flex-col items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <UserSearch size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
            <p className="mt-4 text-sm" style={{ color: 'var(--text-muted)' }}>
              Select a competitor to view their posts.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddCompetitorModal
          onClose={() => setShowModal(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  )
}