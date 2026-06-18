import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useProfileStore } from '@/stores/profileStore'
import {
  TrendingUp,
  BarChart2,
  Users,
  Heart,
  Eye,
  RefreshCw,
  ArrowUpRight,
  Minus,
  Award,
  Zap,
  Loader2,
  AlertCircle,
} from 'lucide-react'

// ─── IPC bridge ───────────────────────────────────────────────────────────────

interface IpcBridge {
  invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
}
const ipc: IpcBridge = (window as any).ipcRenderer ?? { invoke: async () => null }

// ─── Types ────────────────────────────────────────────────────────────────────

type SocialPlatform = 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'linkedin'
type DateRange = '7d' | '30d' | '90d' | 'all'
type Tab = 'overview' | 'top-posts' | 'growth' | 'audience' | 'hashtags'

interface ConnectedAccount {
  id:                   string
  platform:             SocialPlatform
  platform_username:    string
  platform_display_name: string
  avatar_url?:          string
  is_active:            number
}

interface OverviewData {
  totalPosts:        number
  totalEngagements:  number
  avgEngagementRate: number
  followerCount:     number
  followingCount:    number
  impressions:       number
  tiktokLikes?:      number
  instagramReach?:   number
  youtubeLikes?:     number
  youtubeComments?:  number
}

interface TopPost {
  id:              string
  caption:         string
  platform:        SocialPlatform
  permalink?:      string
  thumbnail_url?:  string
  likes:           number
  comments:        number
  shares:          number
  saves:           number
  impressions:     number
  reach:           number
  video_views?:    number
  engagement_rate: number
  published_at:    string
}

interface TrendPoint {
  date:           string
  avg_engagement: number
  likes:          number
  comments:       number
  shares:         number
  post_count:     number
}

interface AccountMetric {
  follower_count: number
  following_count: number
  total_posts:    number
  recorded_at:    string
  platform:       string
}

interface PostingTime {
  hour:           number
  day_of_week:    number
  avg_engagement: number
  post_count:     number
}

interface HashtagStat {
  hashtag:        string
  avg_engagement: number
  total_likes:    number
  post_count:     number
}

interface DemographicRow {
  label: string
  value: number
}

interface Demographics {
  countries: DemographicRow[]
  cities:    DemographicRow[]
  genderAge: DemographicRow[]
}

const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  instagram: '#E4405F', 
  tiktok: '#69C9D0', 
  twitter: '#1DA1F2',
  youtube: '#FF0000', 
  linkedin: '#0A66C2',
}

// Platform SVG icons (inline, no lucide dependency)
const PlatformIcon = ({ platform, size = 14 }: { platform: SocialPlatform; size?: number }) => {
  const paths: Record<SocialPlatform, string> = {
    instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
    tiktok: 'M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z',
    twitter: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z',
    youtube: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d={paths[platform]} />
    </svg>
  )
}

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(Math.round(n))
}

// ─── TrendChart ───────────────────────────────────────────────────────────────

function TrendChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) return (
    <div className="flex h-40 items-center justify-center text-sm" style={{ color: 'var(--text-muted)' }}>
      No trend data yet — sync your analytics first.
    </div>
  )

  const W = 600; const H = 160
  const PAD = { top: 10, right: 10, bottom: 24, left: 36 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom
  const vals = data.map(d => d.avg_engagement)
  const maxVal = Math.max(...vals, 1)
  const x = (i: number) => PAD.left + (i / Math.max(data.length - 1, 1)) * iW
  const y = (v: number) => PAD.top + iH - (v / maxVal) * iH
  const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.avg_engagement).toFixed(1)}`).join(' ')

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: H }}>
      {[0, 0.25, 0.5, 0.75, 1].map(t => {
        const yp = PAD.top + iH * (1 - t)
        return (
          <g key={t}>
            <line x1={PAD.left} y1={yp} x2={W - PAD.right} y2={yp}
              stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
            <text x={PAD.left - 4} y={yp + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)">
              {(t * maxVal).toFixed(1)}%
            </text>
          </g>
        )
      })}
      {data.map((d, i) => (
        <text key={i} x={x(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="var(--text-muted)">
          {d.date ? d.date.substring(5) : ''}
        </text>
      ))}
      <path d={path} fill="none" stroke="var(--primary)" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
      {data.length > 0 && (
        <circle cx={x(data.length - 1)} cy={y(vals[vals.length - 1])} r="3" fill="var(--primary)" />
      )}
    </svg>
  )
}

// ─── OverviewTab ──────────────────────────────────────────────────────────────

function OverviewTab({ overview, trend, syncing, platform }: {
  overview: OverviewData | null
  trend:    TrendPoint[]
  syncing:  boolean
  platform?: SocialPlatform
}) {
  const stats = overview ? [
    { label: platform === 'youtube' ? 'Total Videos' : 'Total Posts', value: fmt(overview.totalPosts), icon: BarChart2, color: 'var(--primary)' },
    { label: 'Total Engagements', value: fmt(overview.totalEngagements), icon: Heart, color: '#E4405F' },
    { label: 'Avg. Engagement', value: overview.avgEngagementRate + '%', icon: TrendingUp, color: 'var(--success)' },
    { label: platform === 'youtube' ? 'Subscribers' : 'Followers', value: fmt(overview.followerCount), icon: Users, color: 'var(--secondary)' },
    { label: platform === 'youtube' ? 'Total Views' : 'Impressions', value: fmt(overview.impressions), icon: Eye, color: '#A84FFF' },
  ] : []
  
  // Add platform-specific stats
  if (platform === 'youtube' && overview) {
    stats.push({ label: 'Total Likes', value: fmt(overview.youtubeLikes || 0), icon: Heart, color: '#FF0000' })
    stats.push({ label: 'Comments', value: fmt(overview.youtubeComments || 0), icon: Users, color: '#A84FFF' })
  }
  
  if (platform === 'tiktok' && overview?.tiktokLikes !== undefined) {
    stats.push({ label: 'Total Likes', value: fmt(overview.tiktokLikes), icon: Heart, color: '#E4405F' })
  }
  
  if (platform === 'instagram' && overview?.instagramReach !== undefined) {
    stats.push({ label: 'Profile Reach', value: fmt(overview.instagramReach), icon: Users, color: '#A84FFF' })
  }

  if (!platform && overview) {
    if (overview.instagramReach) {
      stats.push({ label: 'Instagram Reach', value: fmt(overview.instagramReach), icon: Users, color: '#E4405F' })
    }
    if (overview.tiktokLikes) {
      stats.push({ label: 'TikTok Likes', value: fmt(overview.tiktokLikes), icon: Heart, color: '#69C9D0' })
    }
    if (overview.youtubeLikes) {
      stats.push({ label: 'YouTube Likes', value: fmt(overview.youtubeLikes), icon: Heart, color: '#FF0000' })
    }
  }

  if (platform !== 'youtube') {
    stats.push({ label: 'Following', value: fmt(overview?.followingCount || 0), icon: Users, color: 'var(--secondary)' })
  }

  stats.push({ label: 'Data Source', value: !platform ? 'All Channels' : platform === 'tiktok' ? 'TikTok' : platform === 'youtube' ? 'YouTube' : 'Instagram', icon: Zap, color: 'var(--warning)' })

  if (syncing) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Syncing your {!platform ? 'social' : platform === 'tiktok' ? 'TikTok' : platform === 'youtube' ? 'YouTube' : 'Instagram'} analytics...</p>
    </div>
  )

  if (!overview) return (
    <div className="flex flex-col items-center justify-center rounded-2xl py-20"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <BarChart2 size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
      <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No analytics data yet</p>
      <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
        Click "Sync" to fetch your {!platform ? 'social' : platform === 'tiktok' ? 'TikTok' : platform === 'youtube' ? 'YouTube' : 'Instagram'} analytics.
      </p>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((stat, i) => (
          <div key={stat.label} className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${stat.color}18`, color: stat.color }}>
                <stat.icon size={15} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold" style={{ color: 'var(--text)' }}>{stat.value}</p>
            {i === 0 && (
              <div className="mt-2 flex items-center gap-1">
                <ArrowUpRight size={13} style={{ color: 'var(--success)' }} />
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Live from {platform === 'tiktok' ? 'TikTok' : platform === 'youtube' ? 'YouTube' : 'Instagram'}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="mb-1 text-sm font-semibold" style={{ color: 'var(--text)' }}>Engagement Rate Trend</h3>
        <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>Daily avg. engagement rate from your posts</p>
        <TrendChart data={trend} />
      </div>
    </div>
  )
}

// ─── TopPostsTab ──────────────────────────────────────────────────────────────

function TopPostsTab({ posts }: { posts: TopPost[] }) {
  const [sortBy, setSortBy] = useState<'engagement_rate' | 'likes' | 'impressions'>('engagement_rate')

  const sorted = [...posts].sort((a, b) => {
    if (sortBy === 'likes') return b.likes - a.likes
    if (sortBy === 'impressions') return b.impressions - a.impressions
    return b.engagement_rate - a.engagement_rate
  })

  if (!posts.length) return (
    <div className="flex flex-col items-center justify-center rounded-2xl py-20"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <Award size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
      <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No posts synced yet</p>
      <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Sync your analytics to see top posts.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sort by:</span>
        {(['engagement_rate', 'likes', 'impressions'] as const).map(key => (
          <button key={key} onClick={() => setSortBy(key)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              backgroundColor: sortBy === key ? 'rgba(108,59,255,0.18)' : 'var(--bg-card)',
              color: sortBy === key ? '#A084FF' : 'var(--text-muted)',
              border: `1px solid ${sortBy === key ? 'var(--primary)' : 'var(--border)'}`,
            }}>
            {key === 'engagement_rate' ? 'Engagement' : key === 'likes' ? 'Likes' : 'Views'}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-12 gap-4 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
          <div className="col-span-1">#</div>
          <div className="col-span-5">Post</div>
          <div className="col-span-1 text-right">Likes</div>
          <div className="col-span-1 text-right">Comments</div>
          <div className="col-span-1 text-right">Reach</div>
          <div className="col-span-1 text-right">Views</div>
          <div className="col-span-2 text-right">Eng. Rate</div>
        </div>
        {sorted.map((post, i) => (
          <div key={post.id}
            className="grid grid-cols-12 items-center gap-4 px-5 py-4 transition-all hover:bg-[var(--bg-hover)]"
            style={{ backgroundColor: 'var(--bg-card)', borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div className="col-span-1 flex items-center">
              {i === 0 ? <Award size={16} style={{ color: '#FCD34D' }} />
                : i === 1 ? <Award size={16} style={{ color: '#9CA3AF' }} />
                : i === 2 ? <Award size={16} style={{ color: '#CD7F32' }} />
                : <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>}
            </div>
            <div className="col-span-5 flex min-w-0 items-center gap-3">
              {post.thumbnail_url ? (
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-black">
                  <img src={post.thumbnail_url} alt="" className="h-full w-full object-cover" />
                  <div className="absolute right-1 top-1 flex h-3 w-3 items-center justify-center rounded-sm bg-black/60">
                    <PlatformIcon platform={post.platform} size={8} />
                  </div>
                </div>
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: PLATFORM_COLORS[post.platform] ?? '#888' }}>
                  {post.platform.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm" style={{ color: 'var(--text)' }}>{post.caption || '(no title)'}</p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''}
                </p>
              </div>
            </div>
            <div className="col-span-1 text-right text-sm font-medium" style={{ color: 'var(--text)' }}>{fmt(post.likes)}</div>
            <div className="col-span-1 text-right text-sm font-medium" style={{ color: 'var(--text)' }}>{fmt(post.comments)}</div>
            <div className="col-span-1 text-right text-sm" style={{ color: 'var(--text-muted)' }}>{fmt(post.reach)}</div>
            <div className="col-span-1 text-right text-sm" style={{ color: 'var(--text-muted)' }}>{fmt(post.impressions)}</div>
            <div className="col-span-2 flex items-center justify-end gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--bg-hover)' }}>
                <div className="h-full rounded-full" style={{
                  width: `${Math.min((post.engagement_rate / 15) * 100, 100)}%`,
                  backgroundColor: post.engagement_rate >= 10 ? 'var(--success)' : post.engagement_rate >= 5 ? 'var(--warning)' : 'var(--text-muted)',
                }} />
              </div>
              <span className="text-sm font-bold" style={{
                color: post.engagement_rate >= 10 ? 'var(--success)' : post.engagement_rate >= 5 ? 'var(--warning)' : 'var(--text-muted)',
              }}>{post.engagement_rate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── GrowthTab ────────────────────────────────────────────────────────────────

function GrowthTab({ accountMetrics, platform }: { accountMetrics: AccountMetric[], platform?: SocialPlatform }) {
  if (!accountMetrics.length) return (
    <div className="flex flex-col items-center justify-center rounded-2xl py-20"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <Users size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
      <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No growth data yet</p>
      <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Sync your analytics to track {platform === 'youtube' ? 'subscriber' : 'follower'} growth.</p>
    </div>
  )

  const latest = accountMetrics[0]
  const prev   = accountMetrics[1]
  const growth = prev ? (((latest.follower_count - prev.follower_count) / prev.follower_count) * 100).toFixed(1) : null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{platform === 'youtube' ? 'Total Subscribers' : 'Total Followers'}</p>
          <p className="mt-3 text-3xl font-bold" style={{ color: 'var(--text)' }}>{fmt(latest.follower_count)}</p>
          {growth && (
            <div className="mt-1.5 flex items-center gap-1">
              <ArrowUpRight size={13} style={{ color: 'var(--success)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>+{growth}% since last sync</span>
            </div>
          )}
        </div>
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{platform === 'youtube' ? 'Total Videos' : 'Total Posts'}</p>
          <p className="mt-3 text-3xl font-bold" style={{ color: 'var(--text)' }}>{latest.total_posts}</p>
          <div className="mt-1.5 flex items-center gap-1">
            <Minus size={12} style={{ color: 'var(--text-muted)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>on {latest.platform}</span>
          </div>
        </div>
        {platform !== 'youtube' && (
          <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Total Following</p>
            <p className="mt-3 text-3xl font-bold" style={{ color: 'var(--text)' }}>{fmt(latest.following_count ?? 0)}</p>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-4 gap-4 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
          <div>Recorded At</div>
          <div className="text-right">{platform === 'youtube' ? 'Subscribers' : 'Followers'}</div>
          {platform !== 'youtube' && <div className="text-right">Following</div>}
          <div className="text-right">{platform === 'youtube' ? 'Videos' : 'Posts'}</div>
        </div>
        {accountMetrics.slice(0, 10).map((row, i) => (
          <div key={i} className="grid grid-cols-4 items-center gap-4 px-5 py-3.5 transition-all hover:bg-[var(--bg-hover)]"
            style={{ backgroundColor: 'var(--bg-card)', borderBottom: i < Math.min(accountMetrics.length, 10) - 1 ? '1px solid var(--border)' : 'none' }}>
            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {new Date(row.recorded_at).toLocaleDateString()}
            </div>
            <div className="text-right text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {fmt(row.follower_count)}
            </div>
            {platform !== 'youtube' && (
              <div className="text-right text-sm" style={{ color: 'var(--text)' }}>
                {fmt(row.following_count ?? 0)}
              </div>
            )}
            <div className="text-right text-sm" style={{ color: 'var(--text)' }}>{row.total_posts}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── AudienceTab ─────────────────────────────────────────────────────────────

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function AudienceTab({ demographics, postingTimes, platform }: {
  demographics: Demographics | null
  postingTimes: PostingTime[]
  platform?: SocialPlatform
}) {
  if (platform === 'tiktok' || platform === 'youtube') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl py-20"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <Users size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
        <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Not supported</p>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
          {platform === 'youtube' 
            ? 'Detailed audience demographics require additional YouTube API scopes.'
            : 'Audience demographics are not supported by the public TikTok API.'}
        </p>
      </div>
    )
  }

  const noData = !demographics && !postingTimes.length

  if (noData) return (
    <div className="flex flex-col items-center justify-center rounded-2xl py-20"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <Users size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
      <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No audience data yet</p>
      <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Sync your analytics to see audience insights.</p>
    </div>
  )

  const maxDemo = (arr: DemographicRow[]) => Math.max(...arr.map(r => r.value), 1)

  return (
    <div className="space-y-6">
      {/* Best posting times heatmap */}
      {postingTimes.length > 0 && (
        <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <h3 className="mb-1 text-sm font-semibold" style={{ color: 'var(--text)' }}>Best Posting Times</h3>
          <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>Hours with highest avg. engagement from your posts</p>
          <div className="space-y-2">
            {postingTimes.slice(0, 5).map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-20 text-xs" style={{ color: 'var(--text-muted)' }}>
                  {DAYS_SHORT[t.day_of_week]} {t.hour}:00
                </span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-hover)' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${(t.avg_engagement / (postingTimes[0]?.avg_engagement || 1)) * 100}%`,
                    backgroundColor: 'var(--primary)',
                  }} />
                </div>
                <span className="w-12 text-right text-xs font-semibold" style={{ color: 'var(--success)' }}>
                  {t.avg_engagement}%
                </span>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {t.post_count} post{t.post_count > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demographics */}
      {demographics && (
        <div className="grid grid-cols-2 gap-4">
          {/* Top countries */}
          {demographics.countries.length > 0 && (
            <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text)' }}>Top Countries</h3>
              <div className="space-y-2">
                {demographics.countries.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-24 truncate text-xs" style={{ color: 'var(--text)' }}>{c.label}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-hover)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${(c.value / maxDemo(demographics.countries)) * 100}%`,
                        backgroundColor: 'var(--secondary)',
                      }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{fmt(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top cities */}
          {demographics.cities.length > 0 && (
            <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text)' }}>Top Cities</h3>
              <div className="space-y-2">
                {demographics.cities.slice(0, 6).map((c, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-24 truncate text-xs" style={{ color: 'var(--text)' }}>{c.label}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-hover)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${(c.value / maxDemo(demographics.cities)) * 100}%`,
                        backgroundColor: '#A84FFF',
                      }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{fmt(c.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gender/Age */}
          {demographics.genderAge.length > 0 && (
            <div className="col-span-2 rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text)' }}>Age & Gender</h3>
              <div className="grid grid-cols-2 gap-3">
                {demographics.genderAge.map((g, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-20 text-xs" style={{ color: 'var(--text)' }}>{g.label}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-hover)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${(g.value / maxDemo(demographics.genderAge)) * 100}%`,
                        backgroundColor: g.label.startsWith('M') ? 'var(--secondary)' : '#E4405F',
                      }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{fmt(g.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(!demographics?.countries.length && !demographics?.cities.length && !demographics?.genderAge.length) && (
        <div className="rounded-2xl p-5 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Audience demographics require a Business account with sufficient followers.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── HashtagsTab ──────────────────────────────────────────────────────────────

function HashtagsTab({ hashtags, platform }: { hashtags: HashtagStat[], platform?: SocialPlatform }) {
  if (platform === 'tiktok' || platform === 'youtube') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl py-20"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <BarChart2 size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
        <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Not supported</p>
        <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
          {platform === 'youtube'
            ? 'Hashtag analytics are not supported by the YouTube API.'
            : 'Hashtag analytics are not supported by the public TikTok API.'}
        </p>
      </div>
    )
  }

  if (!hashtags.length) return (
    <div className="flex flex-col items-center justify-center rounded-2xl py-20"
      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      <BarChart2 size={40} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
      <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No hashtag data yet</p>
      <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>Sync your analytics to see hashtag performance.</p>
    </div>
  )

  const maxEng = Math.max(...hashtags.map(h => h.avg_engagement), 1)

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="mb-1 text-sm font-semibold" style={{ color: 'var(--text)' }}>Hashtag Performance</h3>
        <p className="mb-5 text-xs" style={{ color: 'var(--text-muted)' }}>
          Hashtags ranked by average engagement rate across your posts
        </p>
        <div className="space-y-3">
          {hashtags.map((h, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-6 text-center text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
              <span className="w-40 truncate text-sm font-medium" style={{ color: 'var(--primary)' }}>{h.hashtag}</span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-hover)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{
                  width: `${(h.avg_engagement / maxEng) * 100}%`,
                  backgroundColor: h.avg_engagement >= 10 ? 'var(--success)' : h.avg_engagement >= 5 ? 'var(--warning)' : 'var(--primary)',
                }} />
              </div>
              <span className="w-12 text-right text-sm font-bold" style={{
                color: h.avg_engagement >= 10 ? 'var(--success)' : h.avg_engagement >= 5 ? 'var(--warning)' : 'var(--text-muted)',
              }}>{h.avg_engagement}%</span>
              <span className="w-16 text-right text-xs" style={{ color: 'var(--text-muted)' }}>{fmt(h.total_likes)} likes</span>
              <span className="w-14 text-right text-xs" style={{ color: 'var(--text-muted)' }}>{h.post_count} post{h.post_count > 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const navigate     = useNavigate()
  const { pathname } = useLocation()
  const { activeWorkspace } = useProfileStore()
  const workspaceId = activeWorkspace?.id ?? 'default-workspace'
  const [range, setRange]                   = useState<DateRange>('30d')
  const [syncing, setSyncing]               = useState(false)
  const [syncError, setSyncError]           = useState<string | null>(null)
  const [overview, setOverview]             = useState<OverviewData | null>(null)
  const [topPosts, setTopPosts]             = useState<TopPost[]>([])
  const [trend, setTrend]                   = useState<TrendPoint[]>([])
  const [accountMetrics, setAccountMetrics] = useState<AccountMetric[]>([])
  const [postingTimes, setPostingTimes]     = useState<PostingTime[]>([])
  const [hashtags, setHashtags]             = useState<HashtagStat[]>([])
  const [demographics, setDemographics]     = useState<Demographics | null>(null)

  // Connected accounts + selected account
  const [accounts, setAccounts]             = useState<ConnectedAccount[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen]     = useState(false)

  const activeTab: Tab = pathname.includes('top-posts')
    ? 'top-posts'
    : pathname.includes('growth')
      ? 'growth'
      : pathname.includes('audience')
        ? 'audience'
        : pathname.includes('hashtags')
          ? 'hashtags'
          : 'overview'

  const tabs = [
    { id: 'overview'  as Tab, label: 'Overview',  href: '/analytics' },
    { id: 'top-posts' as Tab, label: 'Top Posts', href: '/analytics/top-posts' },
    { id: 'growth'    as Tab, label: 'Growth',    href: '/analytics/growth' },
    { id: 'audience'  as Tab, label: 'Audience',  href: '/analytics/audience' },
    { id: 'hashtags'  as Tab, label: 'Hashtags',  href: '/analytics/hashtags' },
  ]

  // Load connected accounts when workspace changes or mounts
  useEffect(() => {
    ipc.invoke('integration:list', workspaceId).then(rows => {
      const accs = (rows as ConnectedAccount[]) ?? []
      setAccounts(accs)
      if (accs.length > 0) {
        // Select first connected account or retain existing one if still valid
        const stillValid = accs.some(a => a.id === selectedAccountId)
        const nextId = stillValid ? selectedAccountId : accs[0].id
        setSelectedAccountId(nextId)
        loadData(nextId, range)
      } else {
        setSelectedAccountId(null)
        setOverview(null)
        setTopPosts([])
        setTrend([])
        setAccountMetrics([])
        setPostingTimes([])
        setHashtags([])
        setDemographics(null)
      }
    }).catch(console.error)
  }, [workspaceId])

  const loadData = useCallback(async (accountId?: string | null, currentRange?: DateRange) => {
    try {
      const id = accountId ?? selectedAccountId
      if (!id) return
      const activeRange = currentRange ?? range
      const [ov, tp, tr, am, pt, ht, dm] = await Promise.all([
        ipc.invoke('analytics:overview',        workspaceId, id, activeRange),
        ipc.invoke('analytics:top-posts',       workspaceId, 20, id, activeRange),
        ipc.invoke('analytics:trend',           workspaceId, id, activeRange),
        ipc.invoke('analytics:account-metrics', workspaceId, id),
        ipc.invoke('analytics:posting-times',   workspaceId, id),
        ipc.invoke('analytics:hashtags',        workspaceId, id),
        ipc.invoke('analytics:demographics',    workspaceId, id),
      ])
      if (ov)  setOverview(ov as OverviewData)
      if (tp)  setTopPosts(tp as TopPost[])
      if (tr)  setTrend((tr as TrendPoint[]).filter(d => d.date != null))
      if (am)  setAccountMetrics(am as AccountMetric[])
      if (pt)  setPostingTimes(pt as PostingTime[])
      if (ht)  setHashtags(ht as HashtagStat[])
      if (dm)  setDemographics(dm as Demographics)
    } catch (e) {
      console.error('Failed to load analytics:', e)
    }
  }, [selectedAccountId, range])

  useEffect(() => {
    if (selectedAccountId) {
      loadData(selectedAccountId, range)
    }
  }, [selectedAccountId, range, loadData])

  const handleSync = async () => {
    if (!selectedAccountId) return
    setSyncing(true)
    setSyncError(null)
    try {
      const results = await ipc.invoke('analytics:sync', workspaceId, selectedAccountId)
      console.log('[Analytics] Sync results:', results)
      await loadData()
    } catch (e: any) {
      setSyncError(e.message ?? 'Sync failed')
    } finally {
      setSyncing(false)
    }
  }

  const selectedPlatform = accounts.find(a => a.id === selectedAccountId)?.platform

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Analytics</h1>
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Real data from your connected social accounts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Platform / account selector */}
          {accounts.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all hover:bg-[var(--bg-hover)]"
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                }}
              >
                {(() => {
                  const selectedAcc = accounts.find(a => a.id === selectedAccountId)
                  if (!selectedAcc) return <span style={{ color: 'var(--text-muted)' }}>Select Platform</span>
                  const color = PLATFORM_COLORS[selectedAcc.platform] ?? '#888'
                  return (
                    <span className="flex items-center gap-2">
                      {selectedAcc.avatar_url ? (
                        <div className="relative flex h-5 w-5 items-center justify-center">
                          <img
                            src={selectedAcc.avatar_url}
                            alt={selectedAcc.platform_username}
                            className="h-5 w-5 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                            style={{ border: `1px solid ${color}` }}
                          />
                          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--bg-card)] p-0.5" style={{ color }}>
                            <PlatformIcon platform={selectedAcc.platform} size={8} />
                          </span>
                        </div>
                      ) : (
                        <span style={{ color }}>
                          <PlatformIcon platform={selectedAcc.platform} size={14} />
                        </span>
                      )}
                      <span>@{selectedAcc.platform_username}</span>
                    </span>
                  )
                })()}
                <span className="ml-1 text-[10px] opacity-60">▼</span>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl p-2.5 z-20 shadow-2xl animate-fade-in"
                    style={{
                      backgroundColor: 'rgba(20, 20, 25, 0.85)',
                      backdropFilter: 'blur(16px)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}>
                    <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                      Select Account
                    </p>
                    <div className="space-y-1">
                      {accounts.map(acc => {
                        const color = PLATFORM_COLORS[acc.platform] ?? '#888'
                        const selected = selectedAccountId === acc.id
                        return (
                          <button
                            key={acc.id}
                            onClick={() => {
                              setSelectedAccountId(acc.id)
                              loadData(acc.id)
                              setDropdownOpen(false)
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:bg-[rgba(255,255,255,0.05)]"
                            style={{
                              color: selected ? color : 'var(--text)',
                              backgroundColor: selected ? `${color}15` : 'transparent',
                            }}
                          >
                            {acc.avatar_url ? (
                              <div className="relative flex h-6 w-6 items-center justify-center flex-shrink-0">
                                <img
                                  src={acc.avatar_url}
                                  alt={acc.platform_username}
                                  className="h-6 w-6 rounded-full object-cover"
                                  referrerPolicy="no-referrer"
                                  style={{ border: `1.5px solid ${selected ? color : 'rgba(255,255,255,0.1)'}` }}
                                />
                                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[rgba(20,20,25,0.95)] p-0.5" style={{ color }}>
                                  <PlatformIcon platform={acc.platform} size={9} />
                                </span>
                              </div>
                            ) : (
                              <span style={{ color }} className="flex-shrink-0">
                                <PlatformIcon platform={acc.platform} size={15} />
                              </span>
                            )}
                            <span className="flex-1 text-left truncate">
                              @{acc.platform_username}
                            </span>
                            {selected && <span className="text-[10px]" style={{ color }}>●</span>}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          {accounts.length === 0 && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
              No accounts connected
            </span>
          )}
          <div className="flex gap-1 rounded-xl p-1"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {(['7d', '30d', '90d', 'all'] as DateRange[]).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  backgroundColor: range === r ? 'var(--bg-hover)' : 'transparent',
                  color: range === r ? 'var(--text)' : 'var(--text-muted)',
                }}>
                {r === '7d' ? '7 days' : r === '30d' ? '30 days' : r === '90d' ? '90 days' : 'All'}
              </button>
            ))}
          </div>
          <button onClick={handleSync} disabled={syncing}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60 glow-primary"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}>
            {syncing
              ? <Loader2 size={13} className="animate-spin" />
              : <RefreshCw size={13} />}
            {syncing ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Error */}
      {syncError && (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm"
          style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)' }}>
          <AlertCircle size={15} />
          {syncError}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => navigate(tab.href)}
            className="flex flex-1 items-center justify-center rounded-lg py-2 text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--bg-hover)' : 'transparent',
              color: activeTab === tab.id ? 'var(--text)' : 'var(--text-muted)',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

    {/* Content */}
      {activeTab === 'overview'  && <OverviewTab overview={overview} trend={trend} syncing={syncing} platform={selectedPlatform} />}
      {activeTab === 'top-posts' && <TopPostsTab posts={topPosts} />}
      {activeTab === 'growth'    && <GrowthTab accountMetrics={accountMetrics} platform={selectedPlatform} />}
      {activeTab === 'audience'  && <AudienceTab demographics={demographics} postingTimes={postingTimes} platform={selectedPlatform} />}
      {activeTab === 'hashtags'  && <HashtagsTab hashtags={hashtags} platform={selectedPlatform} />}
    </div>
  )
}