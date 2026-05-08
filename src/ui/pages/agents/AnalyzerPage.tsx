import { useState } from 'react'
import { Search, Play, RotateCcw, TrendingUp, Hash, FileText, Cpu, ChevronDown } from 'lucide-react'

const platforms = ['Instagram', 'TikTok', 'Twitter', 'YouTube', 'LinkedIn']

const mockReport = {
  seoScore: 74,
  readabilityScore: 88,
  hashtagEffectiveness: 61,
  algorithmAlignmentScore: 79,
  suggestions: [
    'Use more question-based hooks in the first line to boost stop-scroll rate',
    'Hashtag mix is too broad — narrow to 5–8 niche tags per post',
    'Posting at 9 AM on weekdays shows 34% higher reach than current schedule',
    'Competitor @brandX uses carousel posts 3× more — consider adding more carousels',
  ],
  topPerformingPatterns: [
    'Posts starting with a bold statistic get 2.1× more saves',
    'Videos under 30s outperform longer content by 47% on TikTok',
    'Emojis in first line increase engagement by 18%',
  ],
}

function ScoreRing({ value, label, color }: { value: number; label: string; color: string }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" width="80" height="80">
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="5" />
          <circle
            cx="40" cy="40" r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <span className="text-lg font-bold" style={{ color: 'var(--text)' }}>{value}</span>
      </div>
      <span className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  )
}

export default function AnalyzerPage() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['Instagram', 'TikTok'])
  const [includeCompetitors, setIncludeCompetitors] = useState(true)
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
    // Simulate streaming
    const lines = [
      'Loading post history from database...',
      'Fetching competitor data...',
      'Analyzing SEO patterns across 47 posts...',
      'Evaluating hashtag performance...',
      'Scoring algorithm alignment...',
      'Generating improvement suggestions...',
      'Analysis complete ✓',
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
    }, 600)
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: 'linear-gradient(135deg, #6C3BFF, #3BA9FF)' }}
          >
            <Search size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Analyzer Agent</h1>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>SEO · Readability · Algorithm Fit · Hashtag Power</p>
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

        {/* ── Config panel ── */}
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
                    backgroundColor: selectedPlatforms.includes(p) ? 'rgba(108,59,255,0.18)' : 'var(--bg-hover)',
                    color: selectedPlatforms.includes(p) ? '#A084FF' : 'var(--text-muted)',
                    border: `1px solid ${selectedPlatforms.includes(p) ? 'rgba(108,59,255,0.4)' : 'var(--border)'}`,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Include competitors */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>Include Competitors</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Compare against tracked accounts</p>
            </div>
            <button
              onClick={() => setIncludeCompetitors(!includeCompetitors)}
              className="relative h-5 w-9 rounded-full transition-all"
              style={{ backgroundColor: includeCompetitors ? 'var(--primary)' : 'var(--border)' }}
            >
              <span
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
                style={{ left: includeCompetitors ? '18px' : '2px' }}
              />
            </button>
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Model</label>
            <div
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
              style={{ backgroundColor: 'var(--bg-hover)', border: '1px solid var(--border)', color: 'var(--text)' }}
            >
              <div className="flex items-center gap-2">
                <Cpu size={13} style={{ color: 'var(--primary)' }} />
                llama3.2
              </div>
              <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          {/* Run button */}
          <button
            onClick={handleRun}
            disabled={status === 'running' || selectedPlatforms.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, var(--primary), #3BA9FF)' }}
          >
            {status === 'running' ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Analyzing...
              </>
            ) : (
              <>
                <Play size={14} />
                Run Analyzer
              </>
            )}
          </button>
        </div>

        {/* ── Output panel ── */}
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
              <pre
                className="text-xs leading-relaxed whitespace-pre-wrap font-mono"
                style={{ color: '#4ADE80' }}
              >
                {streamText}
                {status === 'running' && <span className="animate-pulse">▋</span>}
              </pre>
            </div>
          )}

          {/* Scores */}
          {status === 'done' && (
            <>
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <p className="mb-5 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  Scores
                </p>
                <div className="flex justify-around">
                  <ScoreRing value={mockReport.seoScore} label="SEO" color="#6C3BFF" />
                  <ScoreRing value={mockReport.readabilityScore} label="Readability" color="#3BA9FF" />
                  <ScoreRing value={mockReport.hashtagEffectiveness} label="Hashtags" color="#A84FFF" />
                  <ScoreRing value={mockReport.algorithmAlignmentScore} label="Algorithm" color="#22C55E" />
                </div>
              </div>

              {/* Suggestions */}
              <div
                className="rounded-2xl p-5 space-y-3"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={14} style={{ color: 'var(--primary)' }} />
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Suggestions
                  </p>
                </div>
                {mockReport.suggestions.map((s, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                      style={{ backgroundColor: 'rgba(108,59,255,0.18)', color: '#A084FF' }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-sm" style={{ color: 'var(--text)' }}>{s}</p>
                  </div>
                ))}
              </div>

              {/* Patterns */}
              <div
                className="rounded-2xl p-5 space-y-3"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Hash size={14} style={{ color: 'var(--secondary)' }} />
                  <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Top Performing Patterns
                  </p>
                </div>
                {mockReport.topPerformingPatterns.map((p, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-sm" style={{ color: 'var(--secondary)' }}>✦</span>
                    <p className="text-sm" style={{ color: 'var(--text)' }}>{p}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Empty state */}
          {status === 'idle' && (
            <div
              className="flex flex-col items-center justify-center rounded-2xl py-16 text-center"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px dashed var(--border)' }}
            >
              <FileText size={32} style={{ color: 'var(--border)' }} className="mb-3" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Configure and run the Analyzer to see your report
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
