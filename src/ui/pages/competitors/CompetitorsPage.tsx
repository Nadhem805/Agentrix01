import { useState } from 'react'
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

interface Competitor {
  id: string
  platform: SocialPlatform
  platformUsername: string
  displayName: string
  followerCount: number
  avgEngagementRate: number
  lastSyncedAt: string
  avatarInitial: string
  avatarColor: string
  postCount: number
}

interface CompetitorPost {
  id: string
  competitorId: string
  caption: string
  mediaType: 'image' | 'video' | 'carousel' | 'reel'
  likes: number
  comments: number
  shares: number
  views?: number
  engagementRate: number
  postedAt: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockCompetitors: Competitor[] = [
  {
    id: '1',
    platform: 'instagram',
    platformUsername: 'contentcreator_pro',
    displayName: 'Content Creator Pro',
    followerCount: 128400,
    avgEngagementRate: 5.2,
    lastSyncedAt: '2 hours ago',
    avatarInitial: 'C',
    avatarColor: '#E4405F',
    postCount: 47,
  },
  {
    id: '2',
    platform: 'twitter',
    platformUsername: 'marketingwizard',
    displayName: 'Marketing Wizard',
    followerCount: 84200,
    avgEngagementRate: 3.8,
    lastSyncedAt: '5 hours ago',
    avatarInitial: 'M',
    avatarColor: '#1DA1F2',
    postCount: 31,
  },
  {
    id: '3',
    platform: 'youtube',
    platformUsername: 'growthhacker',
    displayName: 'Growth Hacker',
    followerCount: 312000,
    avgEngagementRate: 7.1,
    lastSyncedAt: '1 day ago',
    avatarInitial: 'G',
    avatarColor: '#FF0000',
    postCount: 18,
  },
]

const mockPosts: CompetitorPost[] = [
  {
    id: 'p1',
    competitorId: '1',
    caption: '5 content strategies that doubled my engagement in 30 days 🚀 #contentmarketing #growth',
    mediaType: 'carousel',
    likes: 4820,
    comments: 312,
    shares: 891,
    engagementRate: 8.4,
    postedAt: '2 days ago',
  },
  {
    id: 'p2',
    competitorId: '1',
    caption: 'Behind the scenes of my content creation setup 📸 #creator #behindthescenes',
    mediaType: 'reel',
    likes: 9100,
    comments: 540,
    shares: 1200,
    views: 84000,
    engagementRate: 12.1,
    postedAt: '4 days ago',
  },
  {
    id: 'p3',
    competitorId: '2',
    caption: 'The algorithm changed again. Here\'s what you need to know 🧵',
    mediaType: 'image',
    likes: 2100,
    comments: 430,
    shares: 1800,
    engagementRate: 5.2,
    postedAt: '1 day ago',
  },
]

// ─── Platform config ──────────────────────────────────────────────────────────

const platformConfig: Record<SocialPlatform, { label: string; color: string; Icon: React.ElementType }> = {
  instagram: { label: 'Instagram', color: '#E4405F', Icon: InstagramIcon },
  tiktok:    { label: 'TikTok',    color: '#69C9D0', Icon: TikTokIcon },
  twitter:   { label: 'Twitter/X', color: '#1DA1F2', Icon: TwitterIcon },
  youtube:   { label: 'YouTube',   color: '#FF0000', Icon: YoutubeIcon },
  linkedin:  { label: 'LinkedIn',  color: '#0A66C2', Icon: LinkedinIcon },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

// ─── Add Competitor Modal ─────────────────────────────────────────────────────

function AddCompetitorModal({ onClose }: { onClose: () => void }) {
  const [platform, setPlatform] = useState<SocialPlatform>('instagram')
  const [username, setUsername] = useState('')

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
              const { label, color, Icon } = platformConfig[p]
              const selected = platform === p
              return (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  title={label}
                  className="flex flex-col items-center gap-1 rounded-xl py-2.5 text-xs font-medium transition-all"
                  style={{
                    backgroundColor: selected ? `${color}22` : 'var(--bg-card)',
                    border: `1px solid ${selected ? color : 'var(--border)'}`,
                    color: selected ? color : 'var(--text-muted)',
                  }}
                >
                  <Icon size={16} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Username input */}
        <div className="mb-6">
          <label className="mb-1.5 block text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            Username
          </label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              @
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
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

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
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
            onClick={onClose}
            disabled={!username.trim()}
            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40 glow-primary"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            Add Competitor
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
}: {
  competitor: Competitor
  selected: boolean
  onClick: () => void
}) {
  const { label, color, Icon } = platformConfig[competitor.platform]

  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl p-4 text-left transition-all hover:scale-[1.01]"
      style={{
        backgroundColor: selected ? 'rgba(108,59,255,0.10)' : 'var(--bg-card)',
        border: `1px solid ${selected ? 'var(--primary)' : 'var(--border)'}`,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: competitor.avatarColor }}
        >
          {competitor.avatarInitial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {competitor.displayName}
            </p>
            <span
              className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: `${color}22`, color }}
            >
              <Icon size={10} />
              {label}
            </span>
          </div>
          <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
            @{competitor.platformUsername}
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                {formatNumber(competitor.followerCount)}
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Followers
              </p>
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--success)' }}>
                {competitor.avgEngagementRate}%
              </p>
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                Avg. Eng.
              </p>
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>
                {competitor.postCount}
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
          Synced {competitor.lastSyncedAt}
        </p>
        <div className="flex gap-1.5">
          <button
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg p-1.5 transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}
            title="Sync now"
          >
            <RefreshCw size={11} />
          </button>
          <button
            onClick={(e) => e.stopPropagation()}
            className="rounded-lg p-1.5 transition-all hover:opacity-80"
            style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: 'var(--danger)' }}
            title="Remove"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
    </button>
  )
}

// ─── Post Row ─────────────────────────────────────────────────────────────────

function PostRow({ post }: { post: CompetitorPost }) {
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

      {/* Caption */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm" style={{ color: 'var(--text)' }}>
          {post.caption}
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
        <button
          className="opacity-0 group-hover:opacity-100 rounded-lg p-1.5 transition-all"
          style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}
          title="Open post"
        >
          <ExternalLink size={12} />
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CompetitorsPage() {
  const [showModal, setShowModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string>(mockCompetitors[0].id)
  const [search, setSearch] = useState('')

  const selected = mockCompetitors.find((c) => c.id === selectedId)
  const posts = mockPosts.filter((p) => p.competitorId === selectedId)

  const filtered = mockCompetitors.filter(
    (c) =>
      c.displayName.toLowerCase().includes(search.toLowerCase()) ||
      c.platformUsername.toLowerCase().includes(search.toLowerCase())
  )

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
              {mockCompetitors.length}
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
          {filtered.length === 0 ? (
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
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-base font-bold text-white"
                  style={{ backgroundColor: selected.avatarColor }}
                >
                  {selected.avatarInitial}
                </div>
                <div>
                  <p className="text-base font-bold" style={{ color: 'var(--text)' }}>
                    {selected.displayName}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    @{selected.platformUsername} · {platformConfig[selected.platform].label}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                    {formatNumber(selected.followerCount)}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Followers
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold" style={{ color: 'var(--success)' }}>
                    {selected.avgEngagementRate}%
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Avg. Engagement
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                    {selected.postCount}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Tracked Posts
                  </p>
                </div>
                <button
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--bg-hover)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-muted)',
                  }}
                >
                  <RefreshCw size={14} />
                  Sync Posts
                </button>
              </div>
            </div>

            {/* Posts list */}
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  Top Posts
                </h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {posts.length} posts tracked
                </p>
              </div>

              {posts.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center rounded-2xl py-16"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <UserSearch size={32} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                  <p className="mt-3 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    No posts synced yet
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
                    Click "Sync Posts" to fetch the latest content.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {posts.map((post) => (
                    <PostRow key={post.id} post={post} />
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
      {showModal && <AddCompetitorModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
