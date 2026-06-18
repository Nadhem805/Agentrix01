import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useProfileStore } from '@/stores/profileStore'
import logo from '@/assets/logo.png'
import { Command, ArrowRight, ChevronRight, Loader } from 'lucide-react'

export default function LoginPage() {
  const navigate = useNavigate()
  const { profile, activeWorkspace, checkProfile } = useProfileStore()
  const setUser = useAuthStore((s) => s.setUser)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkProfile().then((hasProfile) => {
      if (!hasProfile) {
        navigate('/signup', { replace: true })
      } else {
        setIsLoading(false)
      }
    }).catch((err) => {
      console.error('Failed to load profile context on login:', err)
      setIsLoading(false)
    })
  }, [checkProfile, navigate])

  function handleLaunchActive() {
    if (!profile) return
    
    // Log in locally in authStore
    setUser({
      id: 'local-user',
      email: 'local@agentrix.ai',
      fullName: profile.name,
      isEmailVerified: true,
      subscriptionStatus: 'active',
      subscriptionPlan: 'pro',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    
    // Launch dashboard
    navigate('/dashboard')
  }

  if (isLoading) {
    return (
      <div className="flex w-full items-center justify-center p-6">
        <Loader className="animate-spin text-indigo-400" size={24} />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md animate-fade-in space-y-8 px-4">
      
      {/* Brand Header */}
      <div className="text-center">
        <img
          src={logo}
          alt="Agentrix"
          className="mx-auto mb-4 h-16 w-16 rounded-2xl object-contain shadow-lg glow-primary"
        />
        <h1 className="gradient-text text-3xl font-extrabold tracking-tight">Agentrix</h1>
        <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
          Sign in to your offline workspace
        </p>
      </div>

      {/* Main Glassmorphic Switcher Card */}
      <div
        className="rounded-3xl p-8 space-y-6 backdrop-blur-2xl border border-white/5"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        {profile ? (
          <div className="space-y-6">
            {/* Active profile header */}
            <div className="space-y-2 text-center">
              <div 
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-inner"
                style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))' }}
              >
                {profile.name[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{profile.name}</h2>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Active Workspace: <strong className="text-indigo-300">{activeWorkspace?.name ?? 'My Workspace'}</strong>
                </p>
              </div>
            </div>

            {/* Launch Workspace Button */}
            <button
              onClick={handleLaunchActive}
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:opacity-95 glow-primary"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              Launch Workspace
              <ArrowRight size={16} />
            </button>

            {/* Switch / Add Workspace Row */}
            <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs">
              <span style={{ color: 'var(--text-muted)' }}>Need another workspace?</span>
              <Link
                to="/signup"
                className="flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Create Workspace
                <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5 text-center">
            {/* No profiles found state */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 mx-auto border border-indigo-500/20">
              <Command size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No active profiles found</h3>
              <p className="mt-1 text-xs px-2" style={{ color: 'var(--text-muted)' }}>
                Create a free offline workspace to start publishing and checking analytics.
              </p>
            </div>
            
            <Link
              to="/signup"
              className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:opacity-95 glow-primary"
              style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
            >
              Get Started Free
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      {/* Trust Guarantee footer */}
      <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        ✦ Offline-first & AES-256 encrypted. Your data never leaves your computer.
      </p>
    </div>
  )
}
