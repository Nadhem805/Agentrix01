import { useState } from 'react'
import { CalendarDays, Play, RotateCcw, Clock, Lightbulb, Cpu, ChevronDown } from 'lucide-react'

const platforms = ['Instagram', 'TikTok', 'Twitter', 'YouTube', 'LinkedIn']
const contentGoalOptions = [
  'Grow followers',
  'Increase engagement',
  'Drive website traffic',
  'Build brand awareness',
  'Generate leads',
]

const mockCalendar = [
  { day: 'Mon Jan 6',  platform: 'Instagram', topic: 'Behind-the-scenes product build',    type: 'Reel',     time: '09:00' },
  { day: 'Tue Jan 7',  platform: 'LinkedIn',  topic: 'Lessons from our first 100 users',   type: 'Post',     time: '08:00' },
  { day: 'Wed Jan 8',  platform: 'TikTok',    topic: 'Quick tip: content batching hack',   type: 'Video',    time: '18:00' },
  { day: 'Thu Jan 9',  platform: 'Twitter',   topic: 'Hot take on AI content tools',       type: 'Thread',   time: '12:00' },
  { day: 'Fri Jan 10', platform: 'Instagram', topic: 'User testimonial carousel',          type: 'Carousel', time: '11:00' },
  { day: 'Mon Jan 13', platform: 'YouTube',   topic: 'Full walkthrough: Agentrix demo',    type: 'Video',    time: '15:00' },
  { day: 'Tue Jan 14', platform: 'LinkedIn',  topic: 'Data: best posting times 2025',      type: 'Post',     time: '08:00' },
]

const platformColors: Record<string, string> = {
  Instagram: '#E4405F',
  TikTok:    '#010101',
  Twitter:   '#1DA1F2',
  YouTube:   '#FF0000',
  LinkedIn:  '#0A66C2',
}

const typeColors: Record<string, string> = {
  Reel:     'rgba(168,79,255,0.18)',
  Post:     'rgba(108,59,255,0.18)',
  Video:    'rgba(59,169,255,0.18)',
  Thread:   'rgba(245,158,11,0.18)',
  Carousel: 'rgba(34,197,94,0.18)',
}

const typeTextColors: Record<string, string> = {
  Reel:     '#C97FFF',
  Post:     '#A084FF',
  Video:    '#3BA9FF',
  Thread:   '#FCD34D',
  Carousel: '#4ADE80',
}

export default function PlannerPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram', 'TikTok'])
  const [goal, setGoal] = useState('Grow followers')
  const [daysAhead, setDaysAhead] = useState(30)
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle')
  const [streamText, setStreamText] = useState('')

  function togglePlatform(p: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    )
  }

  function handleRun() {
    setStatus('running')
    setStreamText('')
    const lines = [
      'Loading Analyzer report...',
      'Reading competitor posting patterns...',
      'Calculating optimal posting times per platform...',
      `Generating ${daysAhead}-day content calendar...`,
      'Assigning content types and topics...',
      'Finalizing schedule...',
      'Calendar ready ✓',
    ]
    let i = 0
    const interval = setInterval(() => {
      if (i < lines.length) {
        setStreamText((prev) => prev + (prev ? '\n' : '') + lines[i])
        i++
      } else {
        clearInterval(interval)
        setStatus('done')
      }
    }, 550)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #A84FFF, #6C3BFF)' }}
          >
            <CalendarDays size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Planner Agent</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Content Calendar · Optimal Times · Topic Strategy</p>
          </div>
        </div>
        {status === 'done' && (
          <button
            onClick={() => { setStatus('idle'); setStreamText('') }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* ── Config ── */}
        <div
          className="rounded-2xl p-5 space-y-5 lg:col-span-1"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Configuration
          </p>

          {/* Platforms */}
          <div className="space-y-2">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Platforms</label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
                  style={{
                    backgroundColor: selectedPlatforms.includes(p) ? 'rgba(168,79,255,0.18)' : 'var(--bg-hover)',
                    color: selectedPlatforms.includes(p) ? '#C97FFF' : 'var(--text-muted)',
                    border: `1px solid ${selectedPlatforms.includes(p) ? 'rgba(168,79,255,0.4)' : 'var(--border)'}`,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Goal */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Content Goal</label>
            <div className="space-y-1">
              {contentGoalOptions.map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-all text-left"
                  style={{
                    backgroundColor: goal === g ? 'rgba(168,79,255,0.12)' : 'transparent',
                    color: goal === g ? '#C97FFF' : 'var(--text-muted)',
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: goal === g ? '#A84FFF' : 'var(--border)' }}
                  />
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Days ahead */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Days Ahead</label>
              <span className="text-xs font-bold" style={{ color: '#C97FFF' }}>{daysAhead}</span>
            </div>
            <input
              type="range" min={7} max={90} step={7}
              value={daysAhead}
              onChange={(e) => setDaysAhead(Number(e.target.value))}
              className="w-full accent-purple-500"
            />
            <div className="flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
              <span>7d</span><span>30d</span><span>60d</span><span>90d</span>
            </div>
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Model</label>
            <div
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
              style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <div className="flex items-center gap-2">
                <Cpu size={13} style={{ color: '#A84FFF' }} />
                llama3.2
              </div>
              <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={status === 'running' || selectedPlatforms.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #A84FFF, #6C3BFF)' }}
          >
            {status === 'running' ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Planning...
              </>
            ) : (
              <>
                <Play size={14} />
                Generate Calendar
              </>
            )}
          </button>
        </div>

        {/* ── Output ── */}
        <div className="space-y-5 lg:col-span-2">

          {/* Stream log */}
          {(status === 'running' || (status === 'done' && streamText)) && (
            <div
              className="rounded-2xl p-4"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Agent Log
              </p>
              <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono" style={{ color: '#4ADE80' }}>
                {streamText}
                {status === 'running' && <span className="animate-pulse">▋</span>}
              </pre>
            </div>
          )}

          {/* Calendar */}
          {status === 'done' && (
            <>
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={14} style={{ color: '#A84FFF' }} />
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Generated Schedule ({daysAhead} days)
                  </p>
                </div>
                <div className="space-y-2">
                  {mockCalendar.map((slot, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all hover:scale-[1.01]"
                      style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border)' }}
                    >
                      <div className="w-24 shrink-0">
                        <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{slot.day}</p>
                        <p className="text-xs font-bold" style={{ color: 'var(--text)' }}>{slot.time}</p>
                      </div>
                      <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                        style={{ backgroundColor: platformColors[slot.platform] ?? '#666' }}
                      >
                        {slot.platform[0]}
                      </div>
                      <p className="flex-1 text-sm" style={{ color: 'var(--text)' }}>{slot.topic}</p>
                      <span
                        className="rounded-md px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          backgroundColor: typeColors[slot.type] ?? 'var(--bg-hover)',
                          color: typeTextColors[slot.type] ?? 'var(--text-muted)',
                        }}
                      >
                        {slot.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Topic suggestions */}
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={14} style={{ color: '#FCD34D' }} />
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Topic Suggestions
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'AI tools for creators', 'Day in my life', 'Myth vs reality',
                    'Tutorial: batch content', 'Hot take thread', 'Product comparison',
                    'Community Q&A', 'Behind the numbers',
                  ].map((t) => (
                    <span
                      key={t}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-all hover:opacity-80"
                      style={{
                        backgroundColor: 'var(--bg-hover)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Empty state */}
          {status === 'idle' && (
            <div
              className="flex flex-col items-center justify-center rounded-2xl py-16 text-center"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px dashed var(--border)' }}
            >
              <CalendarDays size={32} style={{ color: 'var(--border)' }} className="mb-3" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Configure and run the Planner to generate your content calendar
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
