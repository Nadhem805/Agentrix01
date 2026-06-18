import { Link } from 'react-router-dom'
import {
  Calendar,
  TrendingUp,
  CheckCircle,
  Activity,
  Sparkles,
  Zap,
  ArrowRight,
  Plus,
  BarChart3,
  Link as LinkIcon,
  PlayCircle,
  MoreHorizontal
} from 'lucide-react'

const stats = [
  {
    label: 'Scheduled Posts',
    value: '12',
    change: '+3 this week',
    trend: 'up',
    icon: Calendar,
    color: 'from-blue-500 to-cyan-400',
    bg: 'rgba(59, 130, 246, 0.1)'
  },
  {
    label: 'Published This Month',
    value: '34',
    change: '+12%',
    trend: 'up',
    icon: CheckCircle,
    color: 'from-purple-500 to-pink-500',
    bg: 'rgba(168, 85, 247, 0.1)'
  },
  {
    label: 'Avg. Engagement',
    value: '4.7%',
    change: '+0.3%',
    trend: 'up',
    icon: TrendingUp,
    color: 'from-emerald-400 to-teal-400',
    bg: 'rgba(52, 211, 153, 0.1)'
  },
  {
    label: 'Active Accounts',
    value: '3',
    change: 'All connected',
    trend: 'neutral',
    icon: Activity,
    color: 'from-amber-400 to-orange-500',
    bg: 'rgba(251, 191, 36, 0.1)'
  },
]

const upcomingPosts = [
  {
    platform: 'Instagram',
    caption: 'New product launch 🚀',
    time: 'Today, 09:00',
    color: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500',
    icon: '📸'
  },
  {
    platform: 'LinkedIn',
    caption: 'Behind the scenes at Agentrix',
    time: 'Today, 12:00',
    color: 'bg-[#0A66C2]',
    icon: '💼'
  },
  {
    platform: 'Twitter',
    caption: 'Quick tip for content creators',
    time: 'Tomorrow, 08:30',
    color: 'bg-[#1DA1F2]',
    icon: '🐦'
  },
]

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#4338CA] opacity-90" />
        {/* Animated Background Orbs */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-purple-500 opacity-20 blur-3xl mix-blend-screen animate-pulse" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-500 opacity-20 blur-3xl mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/20 mb-4">
              <Sparkles size={14} className="text-yellow-300" />
              <span>Agents are currently optimizing your content</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
              Good morning, Nadhem 👋
            </h1>
            <p className="mt-2 text-sm sm:text-base text-indigo-100 font-medium">
              Your content OS is ready. Let's create something extraordinary today.
            </p>
          </div>
          
          <Link
            to="/studio"
            className="group flex flex-shrink-0 items-center gap-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300 hover:scale-105 hover:bg-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <Zap size={18} className="text-amber-500" />
            Quick Generate
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl bg-[#0F172A] border border-white/5"
          >
            {/* Subtle gradient hover background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
            
            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {stat.label}
                </p>
                <div className="mt-3 flex items-end gap-3">
                  <p className="text-3xl font-extrabold tracking-tight text-white">
                    {stat.value}
                  </p>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold"
                    style={{
                      backgroundColor: stat.trend === 'up' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                      color: stat.trend === 'up' ? '#4ADE80' : '#94A3B8',
                    }}
                  >
                    {stat.change}
                  </span>
                </div>
              </div>
              <div 
                className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-inner"
                style={{ backgroundColor: stat.bg }}
              >
                <stat.icon size={24} className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{ color: 'transparent' }} />
                {/* Fallback for icon color if gradient clipping doesn't work */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-80 mix-blend-source-in`} style={{ WebkitMaskImage: 'url(#icon)', maskImage: 'url(#icon)' }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Upcoming Posts Section (Takes up 2 columns on large screens) */}
        <div className="lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-white">
              <PlayCircle size={20} className="text-indigo-500" />
              Upcoming Posts
            </h2>
            <Link
              to="/calendar"
              className="group flex items-center gap-1 text-xs font-semibold transition-colors hover:opacity-80 text-indigo-400"
            >
              View all calendar <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingPosts.map((post, idx) => (
              <div
                key={post.caption + idx}
                className="group relative flex items-center justify-between overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg bg-[#1E293B] border border-white/5"
              >
                {/* Status indicator line */}
                <div className={`absolute left-0 top-0 h-full w-1 ${post.color}`} />
                
                <div className="flex items-center gap-4 pl-2">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-md ${post.color} text-white`}>
                    <span className="text-xl">{post.icon}</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold tracking-tight text-white">
                      {post.caption}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      {post.platform} • {post.time}
                    </p>
                  </div>
                </div>
                <button
                  className="rounded-full p-2 transition-colors text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions (Takes up 1 column on large screens) */}
        <div className="space-y-5">
          <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-white">
            <Zap size={20} className="text-amber-500" />
            Quick Actions
          </h2>
          <div className="flex flex-col gap-3">
            <Link
              to="/studio"
              className="group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white opacity-10 transition-transform duration-500 group-hover:scale-150" />
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm text-white">
                <Plus size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Create New Post</p>
                <p className="text-xs text-indigo-100 font-medium mt-0.5">Generate with AI Creator</p>
              </div>
            </Link>
            
            <Link
              to="/analytics"
              className="group flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-[#1E293B] border border-white/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500 transition-transform group-hover:rotate-12">
                <BarChart3 size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">View Analytics</p>
                <p className="text-xs font-medium mt-0.5 text-slate-400">Check engagement rates</p>
              </div>
            </Link>

            <Link
              to="/integrations"
              className="group flex items-center gap-4 rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md bg-[#1E293B] border border-white/5"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110">
                <LinkIcon size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-white">Connect Account</p>
                <p className="text-xs font-medium mt-0.5 text-slate-400">Link social platforms</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
