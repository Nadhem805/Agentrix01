import { useLocation } from 'react-router-dom'

const pageTitles: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/agents':       'AI Agents',
  '/agents/analyzer': 'Analyzer Agent',
  '/agents/planner':  'Planner Agent',
  '/agents/creator':  'Creator Agent',
  '/studio':       'Content Studio',
  '/calendar':     'Calendar',
  '/competitors':  'Competitors',
  '/analytics':    'Analytics',
  '/integrations': 'Integrations',
  '/settings':     'Settings',
}

export default function TopBar() {
  const { pathname } = useLocation()
  const title = pageTitles[pathname] ?? 'Agentrix'

  return (
    <header
      className="flex h-14 items-center justify-between px-6"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
        {title}
      </h2>

      <div className="flex items-center gap-2">
        {/* New Post button */}
        <button
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90 glow-primary"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
        >
          <span>+</span> New Post
        </button>

        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className="relative flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors hover:bg-[var(--bg-hover)]"
          style={{ color: 'var(--text-muted)' }}
        >
          🔔
          {/* Unread dot */}
          <span
            className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: 'var(--accent)' }}
          />
        </button>
      </div>
    </header>
  )
}
