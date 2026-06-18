import { useLocation, Link } from 'react-router-dom'
import { Bell, Plus, Search, Command } from 'lucide-react'

const pageTitles: Record<string, string> = {
  '/dashboard':    'Dashboard',
  '/agents':       'Agents',
  '/studio':       'Content Studio',
  '/calendar':     'Calendar',
  '/competitors':  'Competitors',
  '/analytics':    'Analytics',
  '/integrations': 'Integrations',
  '/settings':     'Settings',
}

export default function TopBar() {
  const { pathname } = useLocation()
  
  // Find matching title, or default to generic if none matches directly
  // Handles nested routes like /agents/analyzer if they still exist
  const getPageTitle = () => {
    if (pageTitles[pathname]) return pageTitles[pathname]
    const rootPath = '/' + pathname.split('/')[1]
    return pageTitles[rootPath] || 'Agentrix'
  }

  const title = getPageTitle()

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between px-6 backdrop-blur-xl bg-[#0B0F19]/80 border-b border-white/5 shadow-sm transition-all duration-300">
      
      {/* Title Area */}
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400 shadow-inner">
          <Command size={18} />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-white drop-shadow-sm">
          {title}
        </h2>
      </div>

      {/* Actions Area */}
      <div className="flex items-center gap-4">
        
        {/* Search Bar (Visual) */}
        <div className="hidden sm:flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 text-sm text-gray-300 border border-white/5 transition-all focus-within:bg-white/10 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 shadow-inner hover:bg-white/10">
          <Search size={16} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent outline-none placeholder-gray-500 w-48 transition-all focus:w-64 text-white"
          />
          <span className="hidden lg:flex items-center justify-center rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-gray-400 shadow-sm border border-white/10">
            ⌘K
          </span>
        </div>

        {/* Notification bell */}
        <button
          aria-label="Notifications"
          className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-gray-400 transition-all duration-300 hover:bg-white/10 hover:text-white hover:shadow-md border border-transparent hover:border-white/10"
        >
          <Bell size={18} className="transition-transform group-hover:scale-110 group-hover:rotate-12" />
          {/* Unread Ping */}
          <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
          </span>
        </button>

        <div className="h-6 w-px bg-white/10 mx-1"></div>

        {/* New Post button */}
        <Link
          to="/studio"
          className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#6366f1] to-[#a855f7] px-4 py-2 text-sm font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)]"
        >
          <span className="flex items-center justify-center rounded-full bg-white/20 p-0.5 backdrop-blur-sm transition-transform group-hover:rotate-90">
            <Plus size={14} />
          </span>
          New Post
        </Link>
      </div>
    </header>
  )
}
