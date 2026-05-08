import { useState, useRef } from 'react'
import {
  PenSquare, Upload, Hash, Eye, Save, Send,
  X, Plus, Image, Film, Sparkles, Clock,
} from 'lucide-react'
import {
  InstagramIcon, TikTokIcon, TwitterXIcon, YoutubeIcon, LinkedinIcon,
} from '@/components/common/PlatformIcon'

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform = 'instagram' | 'tiktok' | 'twitter' | 'youtube' | 'linkedin'
type Tab = 'write' | 'preview' | 'schedule'

interface MediaFile {
  id: string
  name: string
  type: 'image' | 'video'
  url: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PLATFORMS: {
  id: Platform
  label: string
  icon: React.ReactNode
  charLimit: number
  color: string
}[] = [
  { id: 'instagram', label: 'Instagram', icon: <InstagramIcon size={13} />, charLimit: 2200, color: '#E4405F' },
  { id: 'tiktok',   label: 'TikTok',    icon: <TikTokIcon size={13} />,    charLimit: 2200, color: '#69C9D0' },
  { id: 'twitter',  label: 'X',         icon: <TwitterXIcon size={13} />,  charLimit: 280,  color: '#F5F5F7' },
  { id: 'youtube',  label: 'YouTube',   icon: <YoutubeIcon size={13} />,   charLimit: 5000, color: '#FF0000' },
  { id: 'linkedin', label: 'LinkedIn',  icon: <LinkedinIcon size={13} />,  charLimit: 3000, color: '#0A66C2' },
]

const SUGGESTED_HASHTAGS = [
  '#ContentCreator', '#SocialMedia', '#Marketing', '#GrowthHacking',
  '#DigitalMarketing', '#CreatorEconomy', '#AITools', '#Agentrix',
]

const DRAFTS = [
  { id: '1', title: 'Product launch announcement', platform: 'instagram', status: 'draft',     updatedAt: '2h ago' },
  { id: '2', title: 'Behind the scenes reel',      platform: 'tiktok',    status: 'scheduled', updatedAt: '1d ago' },
  { id: '3', title: 'Weekly tips thread',           platform: 'twitter',   status: 'draft',     updatedAt: '3d ago' },
]

function platformColor(id: string) {
  return PLATFORMS.find((p) => p.id === id)?.color ?? '#666'
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ContentStudioPage() {
  const [activeTab, setActiveTab] = useState<Tab>('write')
  const [caption, setCaption] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [hashtagInput, setHashtagInput] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['instagram'])
  const [media, setMedia] = useState<MediaFile[]>([])
  const [ctaNotes, setCtaNotes] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const activePlatform = PLATFORMS.find((p) => p.id === selectedPlatforms[0])
  const charLimit = activePlatform?.charLimit ?? 2200
  const charCount = caption.length
  const charPct = Math.min((charCount / charLimit) * 100, 100)

  function togglePlatform(id: Platform) {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  function addHashtag(tag: string) {
    const clean = tag.startsWith('#') ? tag : `#${tag}`
    if (!hashtags.includes(clean) && hashtags.length < 30) {
      setHashtags([...hashtags, clean])
    }
    setHashtagInput('')
  }

  function removeHashtag(tag: string) {
    setHashtags(hashtags.filter((h) => h !== tag))
  }

  function handleHashtagKey(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ' ') && hashtagInput.trim()) {
      e.preventDefault()
      addHashtag(hashtagInput.trim())
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newMedia: MediaFile[] = files.map((f) => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : 'image',
      url: URL.createObjectURL(f),
    }))
    setMedia((prev) => [...prev, ...newMedia].slice(0, 10))
  }

  function simulateAI() {
    setAiLoading(true)
    setTimeout(() => {
      setCaption(
        `🚀 Exciting news — we just launched something that's going to change how you create content.\n\nNo more staring at a blank screen. No more guessing what to post.\n\nAgentrix uses local AI to analyze, plan, and create your content — 100% offline.\n\nWhat would you do with 10 extra hours a week? 👇`
      )
      setHashtags(['#ContentCreator', '#AITools', '#SocialMedia', '#Agentrix', '#CreatorEconomy'])
      setAiLoading(false)
    }, 1800)
  }

  return (
    <div className="mx-auto max-w-7xl animate-fade-in">
      <div className="flex h-[calc(100vh-7rem)] gap-6">

        {/* ── Left: Drafts sidebar ── */}
        <div
          className="flex w-60 shrink-0 flex-col rounded-2xl"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Drafts
            </p>
            <button
              className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors hover:bg-[var(--bg-hover)]"
              style={{ color: 'var(--primary)' }}
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {DRAFTS.map((d) => (
              <button
                key={d.id}
                className="w-full rounded-xl p-3 text-left transition-all hover:bg-[var(--bg-hover)]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: platformColor(d.platform) }}
                  />
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: d.status === 'scheduled' ? 'rgba(34,197,94,0.15)' : 'var(--bg-hover)',
                      color: d.status === 'scheduled' ? '#4ADE80' : 'var(--text-muted)',
                    }}
                  >
                    {d.status}
                  </span>
                </div>
                <p className="text-xs font-medium truncate" style={{ color: 'var(--text)' }}>
                  {d.title}
                </p>
                <p className="mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {d.updatedAt}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* ── Center: Editor ── */}
        <div className="flex flex-1 flex-col min-w-0">

          {/* Tab bar */}
          <div
            className="mb-4 flex items-center justify-between rounded-xl p-1"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex gap-1">
              {(['write', 'preview', 'schedule'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold capitalize transition-all"
                  style={{
                    backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                  }}
                >
                  {tab === 'write' && <PenSquare size={12} />}
                  {tab === 'preview' && <Eye size={12} />}
                  {tab === 'schedule' && <Clock size={12} />}
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={simulateAI}
                disabled={aiLoading}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff' }}
              >
                {aiLoading
                  ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : <Sparkles size={12} />}
                {aiLoading ? 'Generating...' : 'AI Write'}
              </button>
              <button
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
              >
                <Save size={12} /> Save Draft
              </button>
              <button
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #3BA9FF, var(--primary))' }}
              >
                <Send size={12} /> Publish
              </button>
            </div>
          </div>

          {/* ── Write tab ── */}
          {activeTab === 'write' && (
            <div
              className="flex flex-1 flex-col rounded-2xl overflow-hidden"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {/* Platform selector */}
              <div className="flex items-center gap-2 px-5 py-3 flex-wrap" style={{ borderBottom: '1px solid var(--border)' }}>
                <span className="text-xs font-medium mr-1" style={{ color: 'var(--text-muted)' }}>Post to:</span>
                {PLATFORMS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => togglePlatform(p.id)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all"
                    style={{
                      backgroundColor: selectedPlatforms.includes(p.id) ? `${p.color}22` : 'var(--bg-hover)',
                      color: selectedPlatforms.includes(p.id) ? p.color : 'var(--text-muted)',
                      border: `1px solid ${selectedPlatforms.includes(p.id) ? `${p.color}55` : 'var(--border)'}`,
                    }}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>

              {/* Caption textarea */}
              <div className="relative flex-1 p-5">
                <textarea
                  className="h-full w-full resize-none bg-transparent text-sm leading-relaxed outline-none"
                  style={{ color: 'var(--text)' }}
                  placeholder="Write your caption here... or click AI Write to generate one."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                {/* Char counter */}
                <div className="absolute bottom-4 right-5 flex items-center gap-2">
                  <div className="h-1.5 w-20 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${charPct}%`,
                        backgroundColor: charPct > 90 ? '#EF4444' : charPct > 70 ? '#F59E0B' : 'var(--primary)',
                      }}
                    />
                  </div>
                  <span
                    className="text-[10px] font-mono"
                    style={{ color: charPct > 90 ? '#EF4444' : 'var(--text-muted)' }}
                  >
                    {charCount}/{charLimit}
                  </span>
                </div>
              </div>

              {/* Hashtags */}
              <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Hash size={12} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                    Hashtags ({hashtags.length}/30)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {hashtags.map((h) => (
                    <span
                      key={h}
                      className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: 'rgba(108,59,255,0.15)', color: '#A084FF' }}
                    >
                      {h}
                      <button onClick={() => removeHashtag(h)} className="hover:opacity-70">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  <input
                    className="bg-transparent text-xs outline-none"
                    style={{ color: 'var(--text)', minWidth: '80px' }}
                    placeholder="+ add tag"
                    value={hashtagInput}
                    onChange={(e) => setHashtagInput(e.target.value)}
                    onKeyDown={handleHashtagKey}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  {SUGGESTED_HASHTAGS.filter((h) => !hashtags.includes(h)).slice(0, 5).map((h) => (
                    <button
                      key={h}
                      onClick={() => addHashtag(h)}
                      className="rounded px-1.5 py-0.5 text-[10px] transition-all hover:opacity-80"
                      style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA notes */}
              <div className="px-5 py-3" style={{ borderTop: '1px solid var(--border)' }}>
                <input
                  className="w-full bg-transparent text-xs outline-none"
                  style={{ color: 'var(--text-muted)' }}
                  placeholder="📌 Internal CTA notes (not published)..."
                  value={ctaNotes}
                  onChange={(e) => setCtaNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* ── Preview tab ── */}
          {activeTab === 'preview' && (
            <div className="flex flex-1 items-start justify-center gap-6 overflow-y-auto py-2">
              {(selectedPlatforms.length > 0 ? selectedPlatforms : ['instagram' as Platform]).map((pid) => {
                const p = PLATFORMS.find((x) => x.id === pid)!
                return (
                  <div
                    key={pid}
                    className="w-72 shrink-0 rounded-2xl overflow-hidden"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-white"
                        style={{ backgroundColor: p.color }}
                      >
                        {p.icon}
                      </div>
                      <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>{p.label}</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
                        >
                          N
                        </div>
                        <div>
                          <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>@nadhem</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Just now</p>
                        </div>
                      </div>
                      {media.length > 0 ? (
                        <img src={media[0].url} alt="" className="w-full rounded-lg object-cover" style={{ maxHeight: '160px' }} />
                      ) : (
                        <div
                          className="flex h-32 items-center justify-center rounded-lg"
                          style={{ backgroundColor: 'var(--bg-hover)', border: '1px dashed var(--border)' }}
                        >
                          <Image size={20} style={{ color: 'var(--border)' }} />
                        </div>
                      )}
                      <p className="text-xs leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>
                        {caption || <span style={{ color: 'var(--text-muted)' }}>Your caption will appear here...</span>}
                      </p>
                      {hashtags.length > 0 && (
                        <p className="text-xs" style={{ color: '#3BA9FF' }}>{hashtags.join(' ')}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Schedule tab ── */}
          {activeTab === 'schedule' && (
            <div
              className="flex flex-1 flex-col rounded-2xl p-6 space-y-6"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text)' }}>Schedule Post</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Set a date and time to auto-publish. Must be at least 5 minutes in the future.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full rounded-lg px-3 py-2.5 text-sm outline-none"
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border)',
                      color: 'var(--text)',
                      colorScheme: 'dark',
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Platforms</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPlatforms.map((pid) => {
                      const p = PLATFORMS.find((x) => x.id === pid)!
                      return (
                        <span
                          key={pid}
                          className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium"
                          style={{ backgroundColor: `${p.color}22`, color: p.color, border: `1px solid ${p.color}44` }}
                        >
                          {p.icon} {p.label}
                        </span>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div
                className="flex items-center gap-3 rounded-xl p-4"
                style={{ backgroundColor: 'rgba(108,59,255,0.08)', border: '1px solid rgba(108,59,255,0.2)' }}
              >
                <Sparkles size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--text)' }}>AI Recommendation</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    Best time for Instagram this week: <strong style={{ color: '#A084FF' }}>Tuesday 9:00 AM</strong> — 34% higher reach
                  </p>
                </div>
                <button
                  className="ml-auto shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                  style={{ backgroundColor: 'rgba(108,59,255,0.18)', color: '#A084FF' }}
                  onClick={() => setScheduledAt('2025-01-07T09:00')}
                >
                  Use this
                </button>
              </div>
              <button
                disabled={!scheduledAt || selectedPlatforms.length === 0}
                className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, var(--primary), #3BA9FF)' }}
              >
                <Clock size={14} />
                Schedule Post
              </button>
            </div>
          )}
        </div>

        {/* ── Right: Media panel ── */}
        <div
          className="flex w-52 shrink-0 flex-col rounded-2xl"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="p-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Media
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl py-5 transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-hover)', border: '2px dashed var(--border)' }}
            >
              <Upload size={18} style={{ color: 'var(--text-muted)' }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Upload media</span>
              <span className="text-[10px]" style={{ color: 'var(--border)' }}>JPG, PNG, MP4</span>
            </button>
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileChange} />
            {media.map((m) => (
              <div key={m.id} className="group relative rounded-lg overflow-hidden">
                {m.type === 'image' ? (
                  <img src={m.url} alt={m.name} className="w-full h-28 object-cover" />
                ) : (
                  <div className="flex h-28 items-center justify-center" style={{ backgroundColor: 'var(--bg-hover)' }}>
                    <Film size={24} style={{ color: 'var(--text-muted)' }} />
                  </div>
                )}
                <button
                  onClick={() => setMedia(media.filter((x) => x.id !== m.id))}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={10} className="text-white" />
                </button>
                <p className="mt-1 truncate text-[10px] px-1" style={{ color: 'var(--text-muted)' }}>{m.name}</p>
              </div>
            ))}
          </div>
          <div className="p-3" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>{media.length}/10 files</p>
          </div>
        </div>
      </div>
    </div>
  )
}
