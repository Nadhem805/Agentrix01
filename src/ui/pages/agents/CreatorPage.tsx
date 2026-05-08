import { useState } from 'react'
import { PenSquare, Play, Copy, Check, Cpu, ChevronDown, Sparkles, Film, Image } from 'lucide-react'

const platforms = ['Instagram', 'TikTok', 'Twitter', 'YouTube', 'LinkedIn']
const tones = ['Professional', 'Casual', 'Humorous', 'Inspirational', 'Educational']

const mockOutput = {
  caption: `🚀 We just hit a milestone that felt impossible 6 months ago.

When we started building Agentrix, we had one goal: make content creation feel effortless — not exhausting.

Here's what we learned along the way 👇

1. Consistency beats perfection every time
2. Your audience wants authenticity, not polish
3. The best content comes from real conversations

What's one thing you wish you knew before starting your content journey? Drop it below 👇

#ContentCreator #SocialMediaMarketing #CreatorEconomy #GrowthMindset #Agentrix`,
  hashtags: ['#ContentCreator', '#SocialMediaMarketing', '#CreatorEconomy', '#GrowthMindset', '#Agentrix', '#ContentStrategy', '#DigitalMarketing'],
  videoScript: `[HOOK - 0:00-0:03]
"I grew from 0 to 10K followers in 90 days — here's the exact system I used."

[PROBLEM - 0:03-0:08]
"Most creators waste hours every week on content that gets zero engagement. Sound familiar?"

[SOLUTION - 0:08-0:20]
"I started using a 3-step system: Analyze what works, Plan 30 days ahead, then Create in batches."

[PROOF - 0:20-0:35]
"In the first month, my engagement rate jumped from 1.2% to 4.7%. My reach tripled."

[CTA - 0:35-0:40]
"Follow for the full breakdown. Link in bio for the free template."`,
  visualRecommendations: [
    'Use a bold text overlay on the first frame — "0 to 10K in 90 days"',
    'Warm, high-contrast lighting — avoid flat or dark backgrounds',
    'Show your face in the first 2 seconds to build trust',
    'Add captions — 85% of videos are watched without sound',
  ],
  alternativeVersions: [
    `The content strategy that changed everything for me 🧵\n\nI used to post randomly and wonder why nothing worked.\n\nThen I discovered the Analyze → Plan → Create loop.\n\nHere's the breakdown...`,
    `Hot take: most creators are working too hard 🔥\n\nYou don't need more content. You need smarter content.\n\nI cut my posting time in half and doubled my reach. Here's how 👇`,
  ],
}

export default function CreatorPage() {
  const [topic, setTopic] = useState('')
  const [platform, setPlatform] = useState('Instagram')
  const [tone, setTone] = useState('Casual')
  const [audience, setAudience] = useState('')
  const [includeScript, setIncludeScript] = useState(false)
  const [status, setStatus] = useState<'idle' | 'running' | 'done'>('idle')
  const [streamText, setStreamText] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'caption' | 'script' | 'alternatives'>('caption')

  function handleRun() {
    if (!topic.trim()) return
    setStatus('running')
    setStreamText('')
    const lines = [
      `Analyzing ${platform} content patterns...`,
      `Applying ${tone.toLowerCase()} tone guidelines...`,
      'Generating caption with hooks and CTAs...',
      'Optimizing hashtag selection...',
      includeScript ? 'Writing video script...' : 'Generating visual recommendations...',
      'Creating alternative versions...',
      'Content ready ✓',
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
    }, 500)
  }

  function handleCopy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const charLimit: Record<string, number> = {
    Instagram: 2200, TikTok: 2200, Twitter: 280, YouTube: 5000, LinkedIn: 3000,
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: 'linear-gradient(135deg, #3BA9FF, #A84FFF)' }}
        >
          <PenSquare size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Creator Agent</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Captions · Hashtags · Video Scripts · Visual Tips</p>
        </div>
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

          {/* Topic */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Topic *</label>
            <textarea
              rows={3}
              placeholder="e.g. How I grew my audience using AI tools"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full resize-none rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--secondary)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,169,255,0.12)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Platform */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Platform</label>
            <div className="flex flex-wrap gap-1.5">
              {platforms.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className="rounded-lg px-2.5 py-1 text-xs font-medium transition-all"
                  style={{
                    backgroundColor: platform === p ? 'rgba(59,169,255,0.18)' : 'var(--bg-hover)',
                    color: platform === p ? '#3BA9FF' : 'var(--text-muted)',
                    border: `1px solid ${platform === p ? 'rgba(59,169,255,0.4)' : 'var(--border)'}`,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
              Char limit: {charLimit[platform].toLocaleString()}
            </p>
          </div>

          {/* Tone */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Tone</label>
            <div className="grid grid-cols-2 gap-1.5">
              {tones.map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className="rounded-lg px-2 py-1.5 text-xs font-medium transition-all"
                  style={{
                    backgroundColor: tone === t ? 'rgba(59,169,255,0.18)' : 'var(--bg-hover)',
                    color: tone === t ? '#3BA9FF' : 'var(--text-muted)',
                    border: `1px solid ${tone === t ? 'rgba(59,169,255,0.4)' : 'var(--border)'}`,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Audience */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Target Audience</label>
            <input
              type="text"
              placeholder="e.g. Content creators, 25-35"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--secondary)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,169,255,0.12)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Video script toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Film size={13} style={{ color: 'var(--text-muted)' }} />
              <p className="text-xs font-medium" style={{ color: 'var(--text)' }}>Include Video Script</p>
            </div>
            <button
              onClick={() => setIncludeScript(!includeScript)}
              className="relative h-5 w-9 rounded-full transition-all"
              style={{ backgroundColor: includeScript ? 'var(--secondary)' : 'var(--border)' }}
            >
              <span
                className="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all"
                style={{ left: includeScript ? '18px' : '2px' }}
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
                <Cpu size={13} style={{ color: 'var(--secondary)' }} />
                llama3.2
              </div>
              <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          <button
            onClick={handleRun}
            disabled={status === 'running' || !topic.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #3BA9FF, #A84FFF)' }}
          >
            {status === 'running' ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Creating...
              </>
            ) : (
              <>
                <Play size={14} />
                Generate Content
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

          {/* Output tabs */}
          {status === 'done' && (
            <>
              {/* Tab bar */}
              <div
                className="flex gap-1 rounded-xl p-1"
                style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                {(['caption', 'script', 'alternatives'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 rounded-lg py-2 text-xs font-semibold capitalize transition-all"
                    style={{
                      backgroundColor: activeTab === tab ? 'var(--primary)' : 'transparent',
                      color: activeTab === tab ? '#fff' : 'var(--text-muted)',
                    }}
                  >
                    {tab === 'script' ? 'Video Script' : tab === 'alternatives' ? 'Alternatives' : 'Caption'}
                  </button>
                ))}
              </div>

              {/* Caption tab */}
              {activeTab === 'caption' && (
                <div className="space-y-4">
                  <div
                    className="relative rounded-2xl p-5"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <button
                      onClick={() => handleCopy(mockOutput.caption, 'caption')}
                      className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:opacity-80"
                      style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                    >
                      {copied === 'caption' ? <Check size={11} /> : <Copy size={11} />}
                      {copied === 'caption' ? 'Copied!' : 'Copy'}
                    </button>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
                      Caption · {platform}
                    </p>
                    <pre className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)', fontFamily: 'inherit' }}>
                      {mockOutput.caption}
                    </pre>
                    <p className="mt-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {mockOutput.caption.length} / {charLimit[platform].toLocaleString()} chars
                    </p>
                  </div>

                  {/* Hashtags */}
                  <div
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        Hashtags
                      </p>
                      <button
                        onClick={() => handleCopy(mockOutput.hashtags.join(' '), 'hashtags')}
                        className="flex items-center gap-1 text-xs transition-all hover:opacity-80"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {copied === 'hashtags' ? <Check size={11} /> : <Copy size={11} />}
                        {copied === 'hashtags' ? 'Copied!' : 'Copy all'}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mockOutput.hashtags.map((h) => (
                        <span
                          key={h}
                          className="rounded-lg px-2.5 py-1 text-xs font-medium"
                          style={{ backgroundColor: 'rgba(59,169,255,0.12)', color: '#3BA9FF' }}
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Visual tips */}
                  <div
                    className="rounded-2xl p-5"
                    style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Image size={13} style={{ color: '#FCD34D' }} />
                      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        Visual Recommendations
                      </p>
                    </div>
                    <div className="space-y-2">
                      {mockOutput.visualRecommendations.map((r, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <span className="text-sm" style={{ color: '#FCD34D' }}>✦</span>
                          <p className="text-sm" style={{ color: 'var(--text)' }}>{r}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Script tab */}
              {activeTab === 'script' && (
                <div
                  className="relative rounded-2xl p-5"
                  style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <button
                    onClick={() => handleCopy(mockOutput.videoScript ?? '', 'script')}
                    className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:opacity-80"
                    style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                  >
                    {copied === 'script' ? <Check size={11} /> : <Copy size={11} />}
                    {copied === 'script' ? 'Copied!' : 'Copy'}
                  </button>
                  <div className="flex items-center gap-2 mb-4">
                    <Film size={14} style={{ color: 'var(--secondary)' }} />
                    <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                      Video Script
                    </p>
                  </div>
                  <pre className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)', fontFamily: 'inherit' }}>
                    {mockOutput.videoScript}
                  </pre>
                </div>
              )}

              {/* Alternatives tab */}
              {activeTab === 'alternatives' && (
                <div className="space-y-4">
                  {mockOutput.alternativeVersions.map((alt, i) => (
                    <div
                      key={i}
                      className="relative rounded-2xl p-5"
                      style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <button
                        onClick={() => handleCopy(alt, `alt-${i}`)}
                        className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all hover:opacity-80"
                        style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                      >
                        {copied === `alt-${i}` ? <Check size={11} /> : <Copy size={11} />}
                        {copied === `alt-${i}` ? 'Copied!' : 'Copy'}
                      </button>
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={12} style={{ color: '#A84FFF' }} />
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                          Version {i + 1}
                        </p>
                      </div>
                      <pre className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)', fontFamily: 'inherit' }}>
                        {alt}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Empty state */}
          {status === 'idle' && (
            <div
              className="flex flex-col items-center justify-center rounded-2xl py-16 text-center"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px dashed var(--border)' }}
            >
              <PenSquare size={32} style={{ color: 'var(--border)' }} className="mb-3" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                Enter a topic and run the Creator to generate your content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
