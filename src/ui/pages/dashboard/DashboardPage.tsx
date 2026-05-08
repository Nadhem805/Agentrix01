const stats = [
  { label: 'Scheduled Posts', value: '12', change: '+3 this week', trend: 'up' },
  { label: 'Published This Month', value: '34', change: '+12%', trend: 'up' },
  { label: 'Avg. Engagement Rate', value: '4.7%', change: '+0.3%', trend: 'up' },
  { label: 'Connected Accounts', value: '3', change: '2 active', trend: 'neutral' },
]

const upcomingPosts = [
  { platform: 'Instagram', caption: 'New product launch 🚀', time: 'Today, 09:00', color: '#E4405F' },
  { platform: 'LinkedIn', caption: 'Behind the scenes at Agentrix', time: 'Today, 12:00', color: '#0A66C2' },
  { platform: 'Twitter', caption: 'Quick tip for content creators', time: 'Tomorrow, 08:30', color: '#1DA1F2' },
]

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          Good morning 👋
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
          Here's what's happening with your content today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl p-5 transition-all hover:scale-[1.02]"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
            }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
              {stat.label}
            </p>
            <div className="mt-2 flex items-end justify-between">
              <p className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
                {stat.value}
              </p>
              <span
                className="text-xs font-semibold"
                style={{
                  color: stat.trend === 'up' ? 'var(--success)' : 'var(--text-muted)',
                }}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Upcoming Posts */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
            Upcoming Posts
          </h2>
          <button
            className="text-xs font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--secondary)' }}
          >
            View all →
          </button>
        </div>

        <div className="space-y-3">
          {upcomingPosts.map((post) => (
            <div
              key={post.caption}
              className="group flex items-center justify-between rounded-xl p-4 transition-all hover:scale-[1.01]"
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: post.color }}
                >
                  {post.platform[0]}
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                    {post.caption}
                  </p>
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {post.platform} • {post.time}
                  </p>
                </div>
              </div>
              <button
                className="opacity-0 group-hover:opacity-100 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  backgroundColor: 'var(--bg-hover)',
                  color: 'var(--text-muted)',
                }}
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text)' }}>
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 glow-primary"
            style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
          >
            <span>+</span> New Post
          </button>
          <button
            className="rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:bg-[var(--bg-hover)]"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            📅 View Calendar
          </button>
          <button
            className="rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:bg-[var(--bg-hover)]"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            🔗 Connect Account
          </button>
          <button
            className="rounded-lg px-4 py-2.5 text-sm font-medium transition-all hover:bg-[var(--bg-hover)]"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
          >
            📊 View Analytics
          </button>
        </div>
      </div>
    </div>
  )
}
