
import { useState } from 'react'
import {
  Bell,
  CheckCheck,
  Trash2,
  CheckCircle2,
  XCircle,
  Calendar,
  Bot,
  RefreshCw,
  Unlink,
  AlertTriangle,
  Info,
  Filter,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type NotificationType =
  | 'post_published'
  | 'post_failed'
  | 'post_scheduled'
  | 'agent_completed'
  | 'agent_failed'
  | 'sync_completed'
  | 'account_disconnected'
  | 'ollama_unavailable'
  | 'system_message'

type FilterType = 'all' | 'unread' | NotificationType

interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  createdAt: string
  metadata?: Record<string, string>
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'post_published',
    title: 'Post Published',
    message: 'Your Instagram reel "5 content strategies..." went live successfully.',
    isRead: false,
    createdAt: '2 minutes ago',
    metadata: { platform: 'Instagram', postId: 'p1' },
  },
  {
    id: '2',
    type: 'agent_completed',
    title: 'Analyzer Agent Completed',
    message: 'Analysis finished in 14.2s. SEO score: 82/100. 6 suggestions ready.',
    isRead: false,
    createdAt: '18 minutes ago',
    metadata: { model: 'llama3.2', duration: '14.2s' },
  },
  {
    id: '3',
    type: 'post_failed',
    title: 'Post Failed',
    message: 'Failed to publish to TikTok — token expired. Reconnect your account to retry.',
    isRead: false,
    createdAt: '1 hour ago',
    metadata: { platform: 'TikTok', reason: 'Token expired' },
  },
  {
    id: '4',
    type: 'account_disconnected',
    title: 'Account Disconnected',
    message: 'Your Twitter/X account @nadhem_io has been revoked. Please reconnect in Integrations.',
    isRead: false,
    createdAt: '3 hours ago',
    metadata: { platform: 'Twitter/X', username: '@nadhem_io' },
  },
  {
    id: '5',
    type: 'sync_completed',
    title: 'Analytics Synced',
    message: 'Metrics updated for 12 posts across Instagram and YouTube.',
    isRead: true,
    createdAt: '5 hours ago',
    metadata: { synced: '12', failed: '0' },
  },
  {
    id: '6',
    type: 'post_scheduled',
    title: 'Post Scheduled',
    message: '"Behind the scenes at Agentrix" scheduled for LinkedIn — Today at 12:00.',
    isRead: true,
    createdAt: 'Yesterday',
    metadata: { platform: 'LinkedIn', scheduledAt: 'Today 12:00' },
  },
  {
    id: '7',
    type: 'agent_completed',
    title: 'Planner Agent Completed',
    message: '30-day content calendar generated with 24 slots across 4 platforms.',
    isRead: true,
    createdAt: 'Yesterday',
    metadata: { model: 'llama3.2', slots: '24' },
  },
  {
    id: '8',
    type: 'ollama_unavailable',
    title: 'Ollama Unavailable',
    message: 'Could not reach Ollama at localhost:11434. Agents are paused until it reconnects.',
    isRead: true,
    createdAt: '2 days ago',
  },
  {
    id: '9',
    type: 'post_published',
    title: 'Post Published',
    message: 'Your YouTube video "Full content creation workflow for 2026" is now live.',
    isRead: true,
    createdAt: '2 days ago',
    metadata: { platform: 'YouTube' },
  },
  {
    id: '10',
    type: 'system_message',
    title: 'Welcome to Agentrix',
    message: 'Your workspace is set up and ready. Connect a social account to get started.',
    isRead: true,
    createdAt: '3 days ago',
  },
]

// ─── Type config ──────────────────────────────────────────────────────────────

const typeConfig: Record<NotificationType, {
  label: string
  Icon: React.ElementType
  color: string
  bg: string
}> = {
  post_published:      { label: 'Published',    Icon: CheckCircle2,   color: 'var(--success)',   bg: 'rgba(34,197,94,0.12)'    },
  post_failed:         { label: 'Failed',        Icon: XCircle,        color: 'var(--danger)',    bg: 'rgba(239,68,68,0.12)'    },
  post_scheduled:      { label: 'Scheduled',     Icon: Calendar,       color: 'var(--secondary)', bg: 'rgba(59,169,255,0.12)'   },
  agent_completed:     { label: 'Agent Done',    Icon: Bot,            color: 'var(--primary)',   bg: 'rgba(108,59,255,0.12)'   },
  agent_failed:        { label: 'Agent Failed',  Icon: AlertTriangle,  color: 'var(--warning)',   bg: 'rgba(245,158,11,0.12)'   },
  sync_completed:      { label: 'Synced',        Icon: RefreshCw,      color: 'var(--secondary)', bg: 'rgba(59,169,255,0.12)'   },
  account_disconnected:{ label: 'Disconnected',  Icon: Unlink,         color: 'var(--warning)',   bg: 'rgba(245,158,11,0.12)'   },
  ollama_unavailable:  { label: 'Ollama',        Icon: AlertTriangle,  color: 'var(--danger)',    bg: 'rgba(239,68,68,0.12)'    },
  system_message:      { label: 'System',        Icon: Info,           color: 'var(--text-muted)', bg: 'var(--bg-hover)'        },
}

const filterGroups: { id: FilterType; label: string }[] = [
  { id: 'all',                  label: 'All' },
  { id: 'unread',               label: 'Unread' },
  { id: 'post_published',       label: 'Published' },
  { id: 'post_failed',          label: 'Failed' },
  { id: 'agent_completed',      label: 'Agents' },
  { id: 'account_disconnected', label: 'Accounts' },
  { id: 'sync_completed',       label: 'Sync' },
]

// ─── Notification row ─────────────────────────────────────────────────────────

function NotificationRow({
  notification,
  onRead,
  onDelete,
}: {
  notification: Notification
  onRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const cfg = typeConfig[notification.type]

  return (
    <div
      className="group relative flex items-start gap-4 rounded-2xl p-4 transition-all hover:scale-[1.005]"
      style={{
        backgroundColor: notification.isRead ? 'var(--bg-card)' : 'rgba(108,59,255,0.06)',
        border: `1px solid ${notification.isRead ? 'var(--border)' : 'rgba(108,59,255,0.2)'}`,
      }}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <span
          className="absolute right-4 top-4 h-2 w-2 rounded-full"
          style={{ backgroundColor: 'var(--primary)' }}
        />
      )}

      {/* Icon */}
      <div
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: cfg.bg, color: cfg.color }}
      >
        <cfg.Icon size={16} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
              {notification.title}
            </p>
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
              style={{ backgroundColor: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </span>
          </div>
          <span className="shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>
            {notification.createdAt}
          </span>
        </div>

        <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
          {notification.message}
        </p>

        {/* Metadata chips */}
        {notification.metadata && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {Object.entries(notification.metadata).map(([k, v]) => (
              <span
                key={k}
                className="rounded-md px-2 py-0.5 text-[10px] font-medium"
                style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--text-muted)' }}
              >
                {k}: {v}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions — visible on hover */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notification.isRead && (
          <button
            onClick={() => onRead(notification.id)}
            title="Mark as read"
            className="rounded-lg p-1.5 transition-all hover:opacity-80"
            style={{ backgroundColor: 'rgba(34,197,94,0.10)', color: 'var(--success)' }}
          >
            <CheckCheck size={13} />
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          title="Delete"
          className="rounded-lg p-1.5 transition-all hover:opacity-80"
          style={{ backgroundColor: 'rgba(239,68,68,0.10)', color: 'var(--danger)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>(mockNotifications)
  const [filter, setFilter] = useState<FilterType>('all')

  const unreadCount = items.filter(n => !n.isRead).length

  const filtered = items.filter(n => {
    if (filter === 'all') return true
    if (filter === 'unread') return !n.isRead
    return n.type === filter
  })

  const markRead = (id: string) =>
    setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))

  const markAllRead = () =>
    setItems(prev => prev.map(n => ({ ...n, isRead: true })))

  const deleteOne = (id: string) =>
    setItems(prev => prev.filter(n => n.id !== id))

  const clearAll = () =>
    setItems(prev => prev.filter(n => !n.isRead))

  return (
    <div className="mx-auto max-w-3xl space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bell size={20} style={{ color: 'var(--primary)' }} />
            <h1 className="text-xl font-bold" style={{ color: 'var(--text)' }}>Notifications</h1>
            {unreadCount > 0 && (
              <span
                className="flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                style={{ backgroundColor: 'rgba(108,59,255,0.18)', color: '#A084FF' }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            Stay on top of publishing events, agent runs, and system alerts.
          </p>
        </div>

        {/* Bulk actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
          {items.some(n => n.isRead) && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all hover:opacity-80"
              style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'var(--danger)' }}
            >
              <Trash2 size={13} />
              Clear read
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        {filterGroups.map(f => {
          const count = f.id === 'all'
            ? items.length
            : f.id === 'unread'
              ? items.filter(n => !n.isRead).length
              : items.filter(n => n.type === f.id).length

          if (count === 0 && f.id !== 'all' && f.id !== 'unread') return null

          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                backgroundColor: filter === f.id ? 'rgba(108,59,255,0.18)' : 'var(--bg-card)',
                color: filter === f.id ? '#A084FF' : 'var(--text-muted)',
                border: `1px solid ${filter === f.id ? 'var(--primary)' : 'var(--border)'}`,
              }}
            >
              {f.label}
              {count > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                  style={{
                    backgroundColor: filter === f.id ? 'rgba(108,59,255,0.25)' : 'var(--bg-hover)',
                    color: filter === f.id ? '#A084FF' : 'var(--text-muted)',
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl py-20"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <Bell size={36} style={{ color: 'var(--text-muted)', opacity: 0.3 }} />
          <p className="mt-4 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
            {filter === 'unread' ? 'All caught up!' : 'No notifications here.'}
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
            {filter === 'unread'
              ? 'You have no unread notifications.'
              : 'Notifications will appear here as events occur.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Unread group */}
          {filter !== 'unread' && filtered.some(n => !n.isRead) && (
            <>
              <p className="px-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Unread
              </p>
              {filtered.filter(n => !n.isRead).map(n => (
                <NotificationRow key={n.id} notification={n} onRead={markRead} onDelete={deleteOne} />
              ))}
              {filtered.some(n => n.isRead) && (
                <p className="mt-4 px-1 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Earlier
                </p>
              )}
            </>
          )}

          {/* Read group (or all when filter is unread/type) */}
          {(filter === 'unread'
            ? filtered
            : filtered.filter(n => n.isRead)
          ).map(n => (
            <NotificationRow key={n.id} notification={n} onRead={markRead} onDelete={deleteOne} />
          ))}
        </div>
      )}
    </div>
  )
}
