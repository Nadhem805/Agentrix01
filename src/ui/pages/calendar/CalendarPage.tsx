import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, Clock, MoreHorizontal } from 'lucide-react'
import {
  InstagramIcon, TikTokIcon, TwitterXIcon, YoutubeIcon, LinkedinIcon,
} from '@/components/common/PlatformIcon'

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'linkedin'
type PostStatus = 'draft' | 'scheduled' | 'published' | 'failed'

interface CalendarPost {
  id: string
  title: string
  platform: Platform
  status: PostStatus
  time: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORM_META: Record<Platform, { color: string; icon: React.ReactNode }> = {
  instagram: { color: '#E4405F', icon: <InstagramIcon size={10} /> },
  tiktok:    { color: '#69C9D0', icon: <TikTokIcon size={10} /> },
  twitter:   { color: '#F5F5F7', icon: <TwitterXIcon size={10} /> },
  youtube:   { color: '#FF0000', icon: <YoutubeIcon size={10} /> },
  linkedin:  { color: '#0A66C2', icon: <LinkedinIcon size={10} /> },
}

const STATUS_COLORS: Record<PostStatus, { bg: string; text: string }> = {
  draft:     { bg: 'rgba(156,163,175,0.15)', text: '#9CA3AF' },
  scheduled: { bg: 'rgba(59,169,255,0.15)',  text: '#3BA9FF' },
  published: { bg: 'rgba(34,197,94,0.15)',   text: '#4ADE80' },
  failed:    { bg: 'rgba(239,68,68,0.15)',   text: '#EF4444' },
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_POSTS: Record<number, CalendarPost[]> = {
  6:  [{ id: '1', title: 'Product launch 🚀',         platform: 'instagram', status: 'scheduled', time: '09:00' }],
  7:  [{ id: '2', title: 'Lessons from 100 users',    platform: 'linkedin',  status: 'scheduled', time: '08:00' },
       { id: '3', title: 'Quick tip thread',           platform: 'twitter',   status: 'draft',     time: '12:00' }],
  8:  [{ id: '4', title: 'Content batching hack',     platform: 'tiktok',    status: 'scheduled', time: '18:00' }],
  10: [{ id: '5', title: 'User testimonial carousel', platform: 'instagram', status: 'published', time: '11:00' }],
  13: [{ id: '6', title: 'Full Agentrix walkthrough', platform: 'youtube',   status: 'scheduled', time: '15:00' }],
  14: [{ id: '7', title: 'Best posting times 2025',   platform: 'linkedin',  status: 'draft',     time: '08:00' }],
  15: [{ id: '8', title: 'Hot take on AI tools',      platform: 'twitter',   status: 'scheduled', time: '10:00' },
       { id: '9', title: 'Behind the scenes reel',    platform: 'tiktok',    status: 'scheduled', time: '19:00' }],
  20: [{ id: '10', title: 'Weekly recap',             platform: 'instagram', status: 'draft',     time: '17:00' }],
  22: [{ id: '11', title: 'Tutorial: batch content',  platform: 'youtube',   status: 'scheduled', time: '14:00' }],
  27: [{ id: '12', title: 'Community Q&A',            platform: 'instagram', status: 'scheduled', time: '12:00' }],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay()
}

// ─── Post pill ────────────────────────────────────────────────────────────────

function PostPill({ post }: { post: CalendarPost }) {
  const meta = PLATFORM_META[post.platform]
  return (
    <div
      className="flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium truncate cursor-pointer transition-all hover:opacity-80"
      style={{ backgroundColor: `${meta.color}20`, color: meta.color, border: `1px solid ${meta.color}30` }}
      title={`${post.time} · ${post.title}`}
    >
      <span className="shrink-0">{meta.icon}</span>
      <span className="truncate">{post.title}</span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CalendarPage() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())
  const [view, setView] = useState<'month' | 'week'>('month')

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  const selectedPosts = selectedDay ? (MOCK_POSTS[selectedDay] ?? []) : []

  // Build calendar grid (6 rows × 7 cols)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  const totalScheduled = Object.values(MOCK_POSTS).flat().filter(p => p.status === 'scheduled').length
  const totalDraft = Object.values(MOCK_POSTS).flat().filter(p => p.status === 'draft').length
  const totalPublished = Object.values(MOCK_POSTS).flat().filter(p => p.status === 'published').length

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      <div className="flex h-[calc(100vh-7rem)] gap-6">

        {/* ── Main calendar ── */}
        <div className="flex flex-1 flex-col min-w-0">

          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={prevMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-[var(--bg-hover)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <h2 className="min-w-[160px] text-center text-base font-bold" style={{ color: 'var(--text)' }}>
                  {MONTHS[month]} {year}
                </h2>
                <button
                  onClick={nextMonth}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-all hover:bg-[var(--bg-hover)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              <button
                onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(today.getDate()) }}
                className="rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                Today
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div
                className="flex gap-1 rounded-lg p-1"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                {(['month', 'week'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className="rounded-md px-3 py-1 text-xs font-semibold capitalize transition-all"
                    style={{
                      backgroundColor: view === v ? 'var(--primary)' : 'transparent',
                      color: view === v ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <button
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
              >
                <Plus size={12} /> New Post
              </button>
            </div>
          </div>

          {/* Calendar grid */}
          <div
            className="flex-1 rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {/* Day headers */}
            <div className="grid grid-cols-7" style={{ borderBottom: '1px solid var(--border)' }}>
              {DAYS.map((d) => (
                <div
                  key={d}
                  className="py-3 text-center text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 h-[calc(100%-44px)]">
              {cells.map((day, i) => {
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                const isSelected = day === selectedDay
                const posts = day ? (MOCK_POSTS[day] ?? []) : []
                const isLastRow = i >= cells.length - 7

                return (
                  <div
                    key={i}
                    onClick={() => day && setSelectedDay(day)}
                    className="flex flex-col p-2 transition-all"
                    style={{
                      borderRight: (i + 1) % 7 !== 0 ? '1px solid var(--border)' : 'none',
                      borderBottom: !isLastRow ? '1px solid var(--border)' : 'none',
                      backgroundColor: isSelected && day ? 'rgba(108,59,255,0.06)' : 'transparent',
                      cursor: day ? 'pointer' : 'default',
                      minHeight: '80px',
                    }}
                  >
                    {day && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
                            style={{
                              backgroundColor: isToday ? 'var(--primary)' : 'transparent',
                              color: isToday ? '#fff' : isSelected ? 'var(--primary)' : 'var(--text-muted)',
                            }}
                          >
                            {day}
                          </span>
                          {posts.length > 0 && (
                            <span
                              className="text-[9px] font-bold rounded-full px-1"
                              style={{ backgroundColor: 'rgba(108,59,255,0.18)', color: '#A084FF' }}
                            >
                              {posts.length}
                            </span>
                          )}
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          {posts.slice(0, 2).map((p) => (
                            <PostPill key={p.id} post={p} />
                          ))}
                          {posts.length > 2 && (
                            <p className="text-[9px] pl-1" style={{ color: 'var(--text-muted)' }}>
                              +{posts.length - 2} more
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="flex w-64 shrink-0 flex-col gap-4">

          {/* Stats */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              This Month
            </p>
            {[
              { label: 'Scheduled', value: totalScheduled, color: '#3BA9FF' },
              { label: 'Drafts',    value: totalDraft,     color: '#9CA3AF' },
              { label: 'Published', value: totalPublished, color: '#4ADE80' },
            ].map((s) => (
              <div key={s.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</span>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{s.value}</span>
              </div>
            ))}
          </div>

          {/* Selected day detail */}
          <div
            className="flex-1 rounded-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
                {selectedDay
                  ? `${MONTHS[month].slice(0, 3)} ${selectedDay}`
                  : 'Select a day'}
              </p>
              {selectedDay && (
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
                  style={{ color: 'var(--primary)' }}
                >
                  <Plus size={13} />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {selectedPosts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Clock size={24} style={{ color: 'var(--border)' }} className="mb-2" />
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {selectedDay ? 'No posts scheduled' : 'Click a day to see posts'}
                  </p>
                </div>
              ) : (
                selectedPosts.map((post) => {
                  const meta = PLATFORM_META[post.platform]
                  const statusStyle = STATUS_COLORS[post.status]
                  return (
                    <div
                      key={post.id}
                      className="group rounded-xl p-3 transition-all hover:scale-[1.01]"
                      style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border)' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                            style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
                          >
                            {meta.icon}
                          </div>
                          <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>
                            {post.title}
                          </p>
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          <MoreHorizontal size={13} />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                          {post.time}
                        </span>
                        <span
                          className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                          style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                        >
                          {post.status}
                        </span>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Platform legend */}
          <div
            className="rounded-2xl p-4"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Platforms
            </p>
            <div className="space-y-2">
              {(Object.entries(PLATFORM_META) as [Platform, { color: string; icon: React.ReactNode }][]).map(([id, meta]) => {
                const count = Object.values(MOCK_POSTS).flat().filter(p => p.platform === id).length
                return (
                  <div key={id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span style={{ color: meta.color }}>{meta.icon}</span>
                      <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{id}</span>
                    </div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
