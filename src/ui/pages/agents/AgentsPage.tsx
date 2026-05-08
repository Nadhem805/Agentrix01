import { useNavigate } from 'react-router-dom'
import { Bot, Search, CalendarDays, PenSquare, ChevronRight, Zap } from 'lucide-react'

const agents = [
  {
    id: 'analyzer',
    name: 'Analyzer Agent',
    tagline: 'Understand what works',
    description:
      'Evaluates your posts for SEO quality, readability, hashtag effectiveness, and platform algorithm alignment. Extracts patterns from competitor content to surface what drives engagement.',
    icon: Search,
    gradient: 'from-[#6C3BFF] to-[#3BA9FF]',
    glow: 'rgba(108,59,255,0.3)',
    metrics: ['SEO Score', 'Readability', 'Hashtag Power', 'Algorithm Fit'],
    href: '/agents/analyzer',
  },
  {
    id: 'planner',
    name: 'Planner Agent',
    tagline: 'Build your content strategy',
    description:
      'Generates intelligent 30-day content calendars with optimal posting times, topic suggestions, and platform-specific scheduling — all based on your Analyzer report and content goals.',
    icon: CalendarDays,
    gradient: 'from-[#A84FFF] to-[#6C3BFF]',
    glow: 'rgba(168,79,255,0.3)',
    metrics: ['30-Day Calendar', 'Optimal Times', 'Topic Ideas', 'Platform Mix'],
    href: '/agents/planner',
  },
  {
    id: 'creator',
    name: 'Creator Agent',
    tagline: 'Generate ready-to-publish content',
    description:
      'Produces platform-optimized captions, hashtag sets, video scripts, and visual recommendations. Outputs multiple variations so you can pick the best fit for your audience.',
    icon: PenSquare,
    gradient: 'from-[#3BA9FF] to-[#A84FFF]',
    glow: 'rgba(59,169,255,0.3)',
    metrics: ['Captions', 'Hashtags', 'Video Scripts', 'Visual Tips'],
    href: '/agents/creator',
  },
]

export default function AgentsPage() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-6xl space-y-10 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Bot size={20} style={{ color: 'var(--primary)' }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--primary)' }}>
              Local AI · Powered by Ollama
            </span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
            AI Agents
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Three specialized agents that work together to analyze, plan, and create your content — 100% offline.
          </p>
        </div>

        {/* Ollama status */}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
          <span style={{ color: 'var(--text-muted)' }}>Ollama not connected</span>
        </div>
      </div>

      {/* ── Pipeline diagram ── */}
      <div
        className="rounded-2xl p-5"
        style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          Agent Pipeline
        </p>
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {['Your Data + Competitors', 'Analyzer', 'Planner', 'Creator', 'Published Content'].map(
            (step, i) => (
              <div key={step} className="flex items-center gap-3 shrink-0">
                {i > 0 && i < 4 ? (
                  <div
                    className="flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                    style={{ background: `linear-gradient(135deg, ${agents[i - 1].gradient.split(' ')[1]}, ${agents[i - 1].gradient.split(' ')[3]})` }}
                  >
                    {step}
                  </div>
                ) : (
                  <div
                    className="rounded-xl px-4 py-2.5 text-sm font-medium"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {step}
                  </div>
                )}
                {i < 4 && (
                  <ChevronRight size={14} style={{ color: 'var(--border)', flexShrink: 0 }} />
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Agent cards ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {agents.map((agent) => {
          const Icon = agent.icon
          return (
            <button
              key={agent.id}
              onClick={() => navigate(agent.href)}
              className="group relative flex flex-col rounded-2xl p-6 text-left transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 30px ${agent.glow}`
                e.currentTarget.style.borderColor = 'rgba(108,59,255,0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              {/* Icon */}
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${agent.gradient}`}
              >
                <Icon size={22} className="text-white" />
              </div>

              {/* Text */}
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                {agent.tagline}
              </p>
              <h2 className="text-lg font-bold mb-3" style={{ color: 'var(--text)' }}>
                {agent.name}
              </h2>
              <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--text-muted)' }}>
                {agent.description}
              </p>

              {/* Metric pills */}
              <div className="mt-5 flex flex-wrap gap-2">
                {agent.metrics.map((m) => (
                  <span
                    key={m}
                    className="rounded-md px-2 py-0.5 text-[11px] font-medium"
                    style={{
                      backgroundColor: 'var(--bg-hover)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {m}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div
                className="mt-5 flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2.5"
                style={{ color: 'var(--primary)' }}
              >
                <Zap size={14} />
                Run Agent
                <ChevronRight size={14} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
