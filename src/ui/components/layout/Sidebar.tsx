import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  LogOut,
  ChevronDown,
  Calendar,
  TrendingUp,
  Bell,
  Store,
  Settings,
  Bot,
  UserSearch,
  type LucideIcon,
  Sparkles,
} from 'lucide-react'
import logo from '@/assets/logo.png'

// ─── Types ────────────────────────────────────────────────────────────────────

type NavChild = { title: string; href: string }

type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  badge?: number
  badgeColor?: 'violet' | 'blue' | 'magenta' | 'green' | 'yellow'
  children?: NavChild[]
}

// ─── Badge color map ──────────────────────────────────────────────────────────

const badgeStyles: Record<string, { bg: string; color: string }> = {
  violet:  { bg: 'rgba(108,59,255,0.18)', color: '#A084FF' },
  blue:    { bg: 'rgba(59,169,255,0.18)', color: '#3BA9FF' },
  magenta: { bg: 'rgba(168,79,255,0.18)', color: '#C97FFF' },
  green:   { bg: 'rgba(34,197,94,0.18)',  color: '#4ADE80' },
  yellow:  { bg: 'rgba(245,158,11,0.18)', color: '#FCD34D' },
}

// ─── Navigation items ─────────────────────────────────────────────────────────

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'AI Agents',
    href: '/agents',
    icon: Bot,
    children: [
      { title: 'Analyzer',  href: '/agents/analyzer' },
      { title: 'Planner',   href: '/agents/planner' },
      { title: 'Creator',   href: '/agents/creator' },
    ],
  },
  {
    title: 'Content Studio',
    href: '/studio',
    icon: FileText,
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: Calendar,
  },
  {
    title: 'Competitors',
    href: '/competitors',
    icon: UserSearch,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: TrendingUp,
    children: [
      { title: 'Overview',  href: '/analytics' },
      { title: 'Top Posts', href: '/analytics/top-posts' },
      { title: 'Growth',    href: '/analytics/growth' },
    ],
  },
  {
    title: 'Integrations',
    href: '/integrations',
    icon: Store,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: Bell,
    badge: 4,
    badgeColor: 'blue',
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isPathActive(href: string, pathname: string) {
  if (pathname === href) return true
  if (href !== '/' && pathname.startsWith(href + '/')) return true
  return false
}

function isChildActive(children: NavChild[] | undefined, pathname: string) {
  return children?.some((c) => pathname.startsWith(c.href)) ?? false
}

// ─── Badge component ──────────────────────────────────────────────────────────

function Badge({ count, color = 'violet' }: { count: number; color?: string }) {
  const style = badgeStyles[color] ?? badgeStyles.violet
  return (
    <span
      className="ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {count}
    </span>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const { pathname } = useLocation()
  const [expanded, setExpanded] = useState<string[]>(() => {
    // Auto-expand any parent whose child matches the current path on mount
    return navItems
      .filter((item) => item.children?.some((c) => pathname.startsWith(c.href)))
      .map((item) => item.title)
  })

  // Auto-expand parent when navigating to a child route
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children?.some((c) => pathname.startsWith(c.href))) {
        setExpanded((prev) => prev.includes(item.title) ? prev : [...prev, item.title])
      }
    })
  }, [pathname])

  const toggle = (title: string) =>
    setExpanded((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    )

  return (
    <aside
      className="flex h-full w-64 flex-col"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex h-16 items-center gap-3 px-5"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <img
          src={logo}
          alt="Agentrix"
          className="h-9 w-9 rounded-xl object-contain"
        />
        <div>
          <p className="gradient-text text-base font-bold leading-tight tracking-tight">
            Agentrix
          </p>
          <p className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>
            Content OS
          </p>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const active = isPathActive(item.href, pathname)
            const childActive = isChildActive(item.children, pathname)
            const isOpen = expanded.includes(item.title)

            // ── Collapsible parent ──
            if (item.children) {
              return (
                <div key={item.title}>
                  <button
                    onClick={() => toggle(item.title)}
                    className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                    style={{
                      backgroundColor: childActive ? 'rgba(108,59,255,0.12)' : 'transparent',
                      color: childActive ? '#A084FF' : 'var(--text-muted)',
                    }}
                    onMouseEnter={(e) => {
                      if (!childActive) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                        e.currentTarget.style.color = 'var(--text)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!childActive) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = 'var(--text-muted)'
                      }
                    }}
                  >
                    <item.icon
                      size={17}
                      style={{ color: childActive ? 'var(--primary)' : 'inherit', flexShrink: 0 }}
                    />
                    <span className="flex-1 text-left">{item.title}</span>
                    {item.badge && item.badge > 0 && (
                      <Badge count={item.badge} color={item.badgeColor} />
                    )}
                    <ChevronDown
                      size={14}
                      className="transition-transform duration-200"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        color: 'var(--text-muted)',
                      }}
                    />
                  </button>

                  {/* Children */}
                  {isOpen && (
                    <div
                      className="ml-4 mt-0.5 space-y-0.5 border-l pl-3"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      {item.children.map((child) => {
                        const childIsActive = pathname === child.href || pathname.startsWith(child.href + '/')
                        return (
                          <NavLink
                            key={child.href}
                            to={child.href}
                            className="block rounded-lg px-3 py-2 text-xs font-medium transition-all"
                            style={{
                              backgroundColor: childIsActive
                                ? 'rgba(108,59,255,0.12)'
                                : 'transparent',
                              color: childIsActive ? '#A084FF' : 'var(--text-muted)',
                            }}
                          >
                            {child.title}
                          </NavLink>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            // ── Regular item ──
            return (
              <NavLink
                key={item.href}
                to={item.href}
                className="relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                style={({ isActive: routerActive }) => ({
                  backgroundColor:
                    routerActive || active ? 'rgba(108,59,255,0.12)' : 'transparent',
                  color: routerActive || active ? '#A084FF' : 'var(--text-muted)',
                })}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)'
                    e.currentTarget.style.color = 'var(--text)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--text-muted)'
                  }
                }}
              >
                {/* Active left bar */}
                {active && (
                  <span
                    className="absolute left-0 h-5 w-0.5 rounded-r-full"
                    style={{ backgroundColor: 'var(--primary)' }}
                  />
                )}
                <item.icon
                  size={17}
                  style={{ color: active ? 'var(--primary)' : 'inherit', flexShrink: 0 }}
                />
                <span className="flex-1">{item.title}</span>
                {item.badge && item.badge > 0 && (
                  <Badge count={item.badge} color={item.badgeColor} />
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* ── User footer ── */}
      <div className="px-3 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        {/* User card */}
        <div
          className="mb-3 rounded-xl p-3"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
            >
              N
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold" style={{ color: 'var(--text)' }}>
                Nadhem
              </p>
              <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>
                nadhem@agentrix.io
              </p>
            </div>
          </div>
          <div className="mt-2.5">
            <span
              className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: 'rgba(108,59,255,0.18)', color: '#A084FF' }}
            >
              <Sparkles size={9} />
              Pro Plan
            </span>
          </div>
        </div>

        {/* Logout */}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all"
          style={{ color: '#EF4444' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <LogOut size={15} />
          Sign out
        </button>
      </div>
    </aside>
  )
}
