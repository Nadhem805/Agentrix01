
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  TrendingUp,
  BarChart2,
  Users,
  Heart,
  Eye,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Award,
  Zap,
  Calendar,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type SocialPlatform = 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'linkedin'
type DateRange = '7d' | '30d' | '90d'

interface StatCard {
  label: string
  value: string
  change: number
  icon: React.ElementType
  color: string
}

interface TopPost {
  id: string
  platform: SocialPlatform
  caption: string
  likes: number
  comments: number
  shares: number
  views?: number
  engagementRate: number
  publishedAt: string
  platformColor: string
  platformInitial: string
}

interface TrendPoint {
  label: string
  instagram: number
  tiktok: number
  twitter: number
  youtube: number
  linkedin: number
}

interface HeatmapCell {
  day: number
  hour: number
  value: number
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const overviewStats: StatCard[] = [
  { label: 'Total Posts',       value: '87',    change: 12,   icon: BarChart2,  color: 'var(--primary)'   },
  { label: 'Total Engagements', value: '48.3K', change: 18.4, icon: Heart,      color: '#E4405F'          },
  { label: 'Avg. Engagement',   value: '4.7%',  change: 0.3,  icon: TrendingUp, color: 'var(--success)'   },
  { label: 'Follower Growth',   value: '+1.2K', change: 8.1,  icon: Users,      color: 'var(--secondary)' },
  { label: 'Impressions',       value: '312K',  change: 22.6, icon: Eye,        color: '#A84FFF'          },
  { label: 'Posting Streak',    value: '14d',   change: 0,    icon: Zap,        color: 'var(--warning)'   },
]

const topPosts: TopPost[] = [
  {
    id: '1', platform: 'instagram',
    caption: '5 content strategies that doubled my engagement #contentmarketing',
    likes: 4820, comments: 312, shares: 891,
    engagementRate: 8.4, publishedAt: 'May 3', platformColor: '#E4405F', platformInitial: 'IG',
  },
  {
    id: '2', platform: 'tiktok',
    caption: 'POV: You finally figured out the algorithm #creator #viral',
    likes: 12400, comments: 980, shares: 3200, views: 184000,
    engagementRate: 14.2, publishedAt: 'May 1', platformColor: '#69C9D0', platformInitial: 'TT',
  },
  {
    id: '3', platform: 'twitter',
    caption: "The algorithm changed again. Here's what you need to know (thread)",
    likes: 2100, comments: 430, shares: 1800,
    engagementRate: 5.2, publishedAt: 'Apr 29', platformColor: '#1DA1F2', platformInitial: 'X',
  },
  {
    id: '4', platform: 'linkedin',
    caption: 'How we grew our audience by 40% in 60 days — a breakdown',
    likes: 1840, comments: 210, shares: 560,
    engagementRate: 6.8, publishedAt: 'Apr 27', platformColor: '#0A66C2', platformInitial: 'LI',
  },
  {
    id: '5', platform: 'youtube',
    caption: 'Full content creation workflow for 2026 (tools + process)',
    likes: 3200, comments: 540, shares: 890, views: 42000,
    engagementRate: 9.1, publishedAt: 'Apr 24', platformColor: '#FF0000', platformInitial: 'YT',
  },
]

const trendData: TrendPoint[] = [
  { label: 'Apr 8',  instagram: 3.2, tiktok: 8.1,  twitter: 2.4, youtube: 5.2, linkedin: 3.8 },
  { label: 'Apr 15', instagram: 4.1, tiktok: 9.4,  twitter: 3.1, youtube: 6.0, linkedin: 4.2 },
  { label: 'Apr 22', instagram: 3.8, tiktok: 11.2, twitter: 2.8, youtube: 7.1, linkedin: 5.0 },
  { label: 'Apr 29', instagram: 5.2, tiktok: 12.8, twitter: 4.0, youtube: 8.4, linkedin: 5.8 },
  { label: 'May 6',  instagram: 4.7, tiktok: 14.2, twitter: 3.6, youtube: 9.1, linkedin: 6.2 },
]

const platformBreakdown = [
  { platform: 'TikTok',    color: '#69C9D0', posts: 24, engagements: 18400, rate: 11.8, pct: 38 },
  { platform: 'Instagram', color: '#E4405F', posts: 31, engagements: 14200, rate: 5.4,  pct: 29 },
  { platform: 'YouTube',   color: '#FF0000', posts: 8,  engagements: 8900,  rate: 8.2,  pct: 18 },
  { platform: 'Twitter/X', color: '#1DA1F2', posts: 18, engagements: 4800,  rate: 3.6,  pct: 10 },
  { platform: 'LinkedIn',  color: '#0A66C2', posts: 6,  engagements: 2000,  rate: 5.1,  pct: 5  },
]

const heatmapData: HeatmapCell[] = Array.from({ length: 7 * 24 }, (_, i) => {
  const day = Math.floor(i / 24)
  const hour = i % 24
  const isWeekday = day >= 1 && day <= 5
  const isMorningPeak = hour >= 9 && hour <= 11
  const isEveningPeak = hour >= 19 && hour <= 21
  const base = isWeekday
    ? (isMorningPeak || isEveningPeak ? Math.random() * 60 + 40 : Math.random() * 20)
    : Math.random() * 30
  return { day, hour, value: Math.round(base) }
})

const growthData = [
  { month: 'Dec', followers: 8200,  posts: 14, reach: 42000  },
  { month: 'Jan', followers: 9100,  posts: 18, reach: 58000  },
  { month: 'Feb', followers: 10400, posts: 22, reach: 74000  },
  { month: 'Mar', followers: 12100, posts: 19, reach: 91000  },
  { month: 'Apr', followers: 14800, posts: 24, reach: 118000 },
  { month: 'May', followers: 16000, posts: 8,  reach: 130000 },
]

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PLATFORM_COLORS: Record<SocialPlatform, string> = {
  instagram: '#E4405F', tiktok: '#69C9D0', twitter: '#1DA1F2', youtube: '#FF0000', linkedin: '#0A66C2',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

// ─── SparkBars ────────────────────────────────────────────────────────────────

function SparkBars({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data)
  return (
    <div className="flex h-10 items-end gap-0.5">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm"
          style={{
            height: `${(v / max) * 100}%`,
            backgroundColor: color,
            opacity: i === data.length - 1 ? 1 : 0.4 + (i / data.length) * 0.5,
          }}
        />
      ))}
    </div>
  )
}

// ─── TrendChart (SVG line chart) ──────────────────────────────────────────────

function TrendChart({ data, platforms }: { data: TrendPoint[]; platforms: SocialPlatform[] }) {
  const W = 600; const H = 160
  const PAD = { top: 10, right: 10, bottom: 24, left: 32 }
  const iW = W - PAD.left - PAD.right
  const iH = H - PAD.top - PAD.bottom
  const allVals = data.flatMap(d => platforms.map(p => d[p]))
  const maxVal = platforms.length ? Math.max(...allVals) : 15
  const x = (i: number) => PAD.left + (i / (data.length - 1)) * iW
  const y = (v: number) => PAD.top + iH - (v / maxVal) * iH
  const path = (p: SocialPlatform) =>
    data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d[p]).toFixed(1)}`).join(' ')

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
          {d.label}
        </text>
      ))}
      {platforms.map(p => (
        <path key={p} d={path(p)} fill="none"
          stroke={PLATFORM_COLORS[p]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {platforms.map(p => {
        const last = data[data.length - 1]
        return <circle key={p} cx={x(data.length - 1)} cy={y(last[p])} r="3" fill={PLATFORM_COLORS[p]} />
      })}
    </svg>
  )
}

// ─── ActivityHeatmap ─────────────────────────────────────────────────────────

function ActivityHeatmap({ cells }: { cells: HeatmapCell[] }) {
  const peakHours = [9, 10, 11, 19, 20, 21]
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1" style={{ minWidth: 520 }}>
        <div className="flex flex-col gap-0.5 pr-1">
          <div className="h-5" />
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="flex h-4 w-6 items-center justify-end">
              {h % 6 === 0 && (
                <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                  {h === 0 ? '12a' : h === 12 ? '12p' : h > 12 ? `${h - 12}p` : `${h}a`}
                </span>
              )}
            </div>
          ))}
        </div>
        {DAYS.map((day, d) => (
          <div key={day} className="flex flex-1 flex-col gap-0.5">
            <div className="flex h-5 items-center justify-center">
              <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>{day}</span>
            </div>
            {Array.from({ length: 24 }, (_, h) => {
              const cell = cells.find(c => c.day === d && c.hour === h)
              const v = cell?.value ?? 0
              const opacity = v === 0 ? 0.05 : 0.1 + (v / 100) * 0.9
              const isPeak = peakHours.includes(h)
              return (
                <div
                  key={h}
                  title={`${day} ${h}:00 — ${v} engagements`}
                  className="h-4 w-full rounded-sm"
                  style={{
                    backgroundColor: isPeak && v > 30
                      ? `rgba(108,59,255,${opacity})`
                      : `rgba(59,169,255,${opacity * 0.6})`,
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── OverviewTab ──────────────────────────────────────────────────────────────

function OverviewTab({ range }: { range: DateRange }) {
  const allPlatforms: SocialPlatform[] = ['instagram', 'tiktok', 'twitter', 'youtube', 'linkedin']
  const [visible, setVisible] = useState<SocialPlatform[]>(allPlatforms)
  const toggle = (p: SocialPlatform) =>
    setVisible(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const sparkData = [
    [62, 65, 70, 74, 78, 83, 87],
    [31, 35, 38, 41, 44, 46, 48],
    [3.8, 4.0, 4.2, 4.4, 4.5, 4.6, 4.7],
    [800, 850, 920, 980, 1050, 1120, 1200],
    [180, 210, 240, 265, 285, 300, 312],
    [8, 9, 10, 11, 12, 13, 14],
  ]
  const sparkColors = [
    'var(--primary)', '#E4405F', 'var(--success)', 'var(--secondary)', '#A84FFF', 'var(--warning)',
  ]
  const rangeLabel = range === '7d' ? 'last 7 days' : range === '30d' ? 'last 30 days' : 'last 90 days'

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {overviewStats.map((stat, i) => (
          <div key={stat.label}
            className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${stat.color}18`, color: stat.color }}>
                <stat.icon size={15} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold" style={{ color: 'var(--text)' }}>{stat.value}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div className="flex items-center gap-1">
                {stat.change > 0
                  ? <ArrowUpRight size={13} style={{ color: 'var(--success)' }} />
                  : stat.change < 0
                    ? <ArrowDownRight size={13} style={{ color: 'var(--danger)' }} />
                    : <Minus size={12} style={{ color: 'var(--text-muted)' }} />}
                <span className="text-xs font-semibold" style={{
                  color: stat.change > 0 ? 'var(--success)' : stat.change < 0 ? 'var(--danger)' : 'var(--text-muted)',
                }}>
                  {stat.change > 0 ? `+${stat.change}%` : stat.change < 0 ? `${stat.change}%` : 'No change'}
                </span>
              </div>
              <div className="w-20 shrink-0">
                <SparkBars data={sparkData[i]} color={sparkColors[i]} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Engagement trend */}
      <div className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              Engagement Rate Trend
            </h3>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
              Weekly avg. per platform — {rangeLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {allPlatforms.map(p => {
              const active = visible.includes(p)
              const color = PLATFORM_COLORS[p]
              const lbl = p === 'instagram' ? 'IG' : p === 'tiktok' ? 'TT' : p === 'twitter' ? 'X' : p === 'youtube' ? 'YT' : 'LI'
              return (
                <button key={p} onClick={() => toggle(p)}
                  className="rounded-lg px-2.5 py-1 text-[10px] font-bold transition-all"
                  style={{
                    backgroundColor: active ? `${color}22` : 'var(--bg-hover)',
                    color: active ? color : 'var(--text-muted)',
                    border: `1px solid ${active ? color : 'transparent'}`,
                  }}>
                  {lbl}
                </button>
              )
            })}
          </div>
        </div>
        <TrendChart data={trendData} platforms={visible} />
      </div>

      {/* Platform breakdown */}
      <div className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text)' }}>Platform Breakdown</h3>
        <div className="space-y-3">
          {platformBreakdown.map(pb => (
            <div key={pb.platform}>
              <div className="mb-1 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: pb.color }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{pb.platform}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{pb.posts} posts</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span style={{ color: 'var(--text-muted)' }}>{fmt(pb.engagements)} eng.</span>
                  <span className="font-semibold" style={{ color: 'var(--success)' }}>{pb.rate}%</span>
                  <span className="w-8 text-right font-bold" style={{ color: 'var(--text)' }}>{pb.pct}%</span>
                </div>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'var(--bg-hover)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pb.pct}%`, backgroundColor: pb.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity heatmap */}
      <div className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Posting Activity Heatmap</h3>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>Engagement intensity by day and hour</p>
          </div>
          <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
            <span>Low</span>
            <div className="flex gap-0.5">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map(o => (
                <div key={o} className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: `rgba(108,59,255,${o})` }} />
              ))}
            </div>
            <span>High</span>
          </div>
        </div>
        <ActivityHeatmap cells={heatmapData} />
      </div>
    </div>
  )
}

// ─── TopPostsTab ──────────────────────────────────────────────────────────────

function TopPostsTab() {
  const [sortBy, setSortBy] = useState<'engagementRate' | 'likes' | 'views'>('engagementRate')
  const sorted = [...topPosts].sort((a, b) => {
    if (sortBy === 'views') return (b.views ?? 0) - (a.views ?? 0)
    return b[sortBy] - a[sortBy]
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sort by:</span>
        {(['engagementRate', 'likes', 'views'] as const).map(key => (
          <button key={key} onClick={() => setSortBy(key)}
            className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              backgroundColor: sortBy === key ? 'rgba(108,59,255,0.18)' : 'var(--bg-card)',
              color: sortBy === key ? '#A084FF' : 'var(--text-muted)',
              border: `1px solid ${sortBy === key ? 'var(--primary)' : 'var(--border)'}`,
            }}>
            {key === 'engagementRate' ? 'Engagement Rate' : key === 'likes' ? 'Likes' : 'Views'}
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
          <div className="col-span-1 text-right">Shares</div>
          <div className="col-span-1 text-right">Views</div>
          <div className="col-span-2 text-right">Eng. Rate</div>
        </div>

        {sorted.map((post, i) => (
          <div key={post.id}
            className="group grid grid-cols-12 items-center gap-4 px-5 py-4 transition-all hover:bg-[var(--bg-hover)]"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
            <div className="col-span-1 flex items-center">
              {i === 0 ? <Award size={16} style={{ color: '#FCD34D' }} />
                : i === 1 ? <Award size={16} style={{ color: '#9CA3AF' }} />
                : i === 2 ? <Award size={16} style={{ color: '#CD7F32' }} />
                : <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>}
            </div>
            <div className="col-span-5 flex min-w-0 items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                style={{ backgroundColor: post.platformColor }}>
                {post.platformInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm" style={{ color: 'var(--text)' }}>{post.caption}</p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{post.publishedAt}</p>
              </div>
            </div>
            <div className="col-span-1 text-right text-sm font-medium" style={{ color: 'var(--text)' }}>
              {fmt(post.likes)}
            </div>
            <div className="col-span-1 text-right text-sm font-medium" style={{ color: 'var(--text)' }}>
              {fmt(post.comments)}
            </div>
            <div className="col-span-1 text-right text-sm font-medium" style={{ color: 'var(--text)' }}>
              {fmt(post.shares)}
            </div>
            <div className="col-span-1 text-right text-sm" style={{ color: 'var(--text-muted)' }}>
              {post.views ? fmt(post.views) : '—'}
            </div>
            <div className="col-span-2 flex items-center justify-end gap-2">
              <div className="h-1.5 w-16 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--bg-hover)' }}>
                <div className="h-full rounded-full" style={{
                  width: `${Math.min((post.engagementRate / 15) * 100, 100)}%`,
                  backgroundColor: post.engagementRate >= 10 ? 'var(--success)' : post.engagementRate >= 5 ? 'var(--warning)' : 'var(--text-muted)',
                }} />
              </div>
              <span className="text-sm font-bold" style={{
                color: post.engagementRate >= 10 ? 'var(--success)' : post.engagementRate >= 5 ? 'var(--warning)' : 'var(--text-muted)',
              }}>
                {post.engagementRate}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── GrowthTab ────────────────────────────────────────────────────────────────

function GrowthBarChart({ data, key1, key2, color1, color2, label1, label2 }: {
  data: typeof growthData
  key1: keyof typeof growthData[0]
  key2: keyof typeof growthData[0]
  color1: string; color2: string; label1: string; label2: string
}) {
  const max = Math.max(...data.flatMap(d => [Number(d[key1]), Number(d[key2])]))
  return (
    <div>
      <div className="mb-3 flex gap-4">
        {[{ color: color1, label: label1 }, { color: color2, label: label2 }].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{l.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-3" style={{ height: 120 }}>
        {data.map(d => (
          <div key={String(d.month)} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex w-full items-end justify-center gap-0.5" style={{ height: 100 }}>
              {[{ val: Number(d[key1]), color: color1 }, { val: Number(d[key2]), color: color2 }].map((b, bi) => (
                <div key={bi} className="flex-1 rounded-t-sm transition-all duration-700"
                  style={{ height: `${(b.val / max) * 100}%`, backgroundColor: b.color, opacity: 0.85 }} />
              ))}
            </div>
            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{d.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function GrowthTab() {
  const latest = growthData[growthData.length - 1]
  const prev   = growthData[growthData.length - 2]
  const fGrowth = (((latest.followers - prev.followers) / prev.followers) * 100).toFixed(1)
  const rGrowth = (((latest.reach - prev.reach) / prev.reach) * 100).toFixed(1)

  const kpis = [
    { label: 'Total Followers',  value: fmt(latest.followers), change: fGrowth, icon: Users,    color: 'var(--secondary)' },
    { label: 'Monthly Reach',    value: fmt(latest.reach),     change: rGrowth, icon: Eye,      color: '#A84FFF'          },
    { label: 'Posts This Month', value: String(latest.posts),  change: null,    icon: Calendar, color: 'var(--primary)'   },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="rounded-2xl p-5"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between">
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{kpi.label}</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${kpi.color}18`, color: kpi.color }}>
                <kpi.icon size={15} />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold" style={{ color: 'var(--text)' }}>{kpi.value}</p>
            {kpi.change !== null && (
              <div className="mt-1.5 flex items-center gap-1">
                <ArrowUpRight size={13} style={{ color: 'var(--success)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--success)' }}>
                  +{kpi.change}% this month
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <h3 className="mb-1 text-sm font-semibold" style={{ color: 'var(--text)' }}>
          Follower Growth vs. Reach
        </h3>
        <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          Monthly comparison over the last 6 months
        </p>
        <GrowthBarChart
          data={growthData}
          key1="followers" key2="reach"
          color1="var(--primary)" color2="var(--secondary)"
          label1="Followers" label2="Reach"
        />
      </div>

      <div className="overflow-hidden rounded-2xl" style={{ border: '1px solid var(--border)' }}>
        <div className="grid grid-cols-4 gap-4 px-5 py-3 text-[10px] font-semibold uppercase tracking-wider"
          style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
          <div>Month</div>
          <div className="text-right">Followers</div>
          <div className="text-right">Reach</div>
          <div className="text-right">Posts</div>
        </div>
        {[...growthData].reverse().map((row, i) => {
          const prevRow = growthData[growthData.length - 2 - i]
          const fg = prevRow ? (((row.followers - prevRow.followers) / prevRow.followers) * 100).toFixed(1) : null
          return (
            <div key={row.month}
              className="grid grid-cols-4 items-center gap-4 px-5 py-3.5 transition-all hover:bg-[var(--bg-hover)]"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderBottom: i < growthData.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
              <div className="text-sm font-medium" style={{ color: 'var(--text)' }}>{row.month}</div>
              <div className="text-right">
                <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                  {fmt(row.followers)}
                </span>
                {fg && <span className="ml-2 text-xs" style={{ color: 'var(--success)' }}>+{fg}%</span>}
              </div>
              <div className="text-right text-sm" style={{ color: 'var(--text)' }}>{fmt(row.reach)}</div>
              <div className="text-right text-sm" style={{ color: 'var(--text)' }}>{row.posts}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'top-posts' | 'growth'

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [range, setRange] = useState<DateRange>('30d')

  const activeTab: Tab = pathname.includes('top-posts')
    ? 'top-posts'
    : pathname.includes('growth')
      ? 'growth'
      : 'overview'

  const tabs: { id: Tab; label: string; href: string }[] = [
    { id: 'overview',  label: 'Overview',  href: '/analytics' },
    { id: 'top-posts', label: 'Top Posts', href: '/analytics/top-posts' },
    { id: 'growth',    label: 'Growth',    href: '/analytics/growth' },
  ]

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
            Track performance across all your connected platforms.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-xl p-1"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {(['7d', '30d', '90d'] as DateRange[]).map(r => (
              <button key={r} onClick={() => setRange(r)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  backgroundColor: range === r ? 'var(--bg-hover)' : 'transparent',
                  color: range === r ? 'var(--text)' : 'var(--text-muted)',
                }}>
                {r === '7d' ? '7 days' : r === '30d' ? '30 days' : '90 days'}
              </button>
            ))}
          </div>
          <button
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            <RefreshCw size={13} />
            Sync
          </button>
        </div>
      </div>

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
      {activeTab === 'overview'  && <OverviewTab range={range} />}
      {activeTab === 'top-posts' && <TopPostsTab />}
      {activeTab === 'growth'    && <GrowthTab />}
    </div>
  )
}
