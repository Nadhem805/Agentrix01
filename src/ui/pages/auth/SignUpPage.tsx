import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'
import { User, Command, Clock, Globe, ArrowRight, Loader, ChevronRight } from 'lucide-react'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { createProfile } = useProfileStore()
  const { setUser } = useAuthStore()

  const [name, setName] = useState('')
  const [workspaceName, setWorkspaceName] = useState('My Workspace')
  const [timezone, setTimezone] = useState('Europe/Paris')
  const [language, setLanguage] = useState('en')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const timezones = [
    { value: 'UTC',             label: 'UTC' },
    { value: 'America/New_York', label: 'Eastern Time (ET)' },
    { value: 'America/Chicago',  label: 'Central Time (CT)' },
    { value: 'America/Denver',   label: 'Mountain Time (MT)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
    { value: 'Europe/London',    label: 'London (GMT)' },
    { value: 'Europe/Paris',     label: 'Paris (CET)' },
    { value: 'Europe/Berlin',    label: 'Berlin (CET)' },
    { value: 'Asia/Dubai',       label: 'Dubai (GST)' },
    { value: 'Asia/Tokyo',       label: 'Tokyo (JST)' },
    { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  ]

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' },
    { value: 'es', label: 'Spanish' },
    { value: 'ar', label: 'Arabic' },
  ]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter your display name.')
      return
    }
    if (!workspaceName.trim()) {
      setError('Please enter a workspace name.')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Create local profile and workspace in SQLite
      const createdProfile = await createProfile({
        name: name.trim(),
        defaultWorkspaceName: workspaceName.trim(),
      })

      if (createdProfile) {
        // Authenticate locally in authStore
        setUser({
          id: 'local-user',
          email: 'local@agentrix.ai',
          fullName: createdProfile.name,
          isEmailVerified: true,
          subscriptionStatus: 'active',
          subscriptionPlan: 'pro',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        // Route directly to dashboard
        navigate('/dashboard', { replace: true })
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during local account setup.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in space-y-6 px-4">
      
      {/* Header Branding */}
      <div className="text-center space-y-3">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-lg glow-primary">
          <Command size={28} />
        </div>
        <div>
          <h1 className="gradient-text text-3xl font-extrabold tracking-tight">Welcome to Agentrix</h1>
          <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
            Set up your local offline workspace in seconds
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div
        className="rounded-3xl p-8 backdrop-blur-2xl transition-all duration-300 border border-white/5"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-lg font-bold text-white mb-2">Free Account Setup</h2>

          {error && (
            <div 
              className="rounded-xl px-4 py-3 text-xs font-semibold border border-red-500/20"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#F87171' }}
            >
              {error}
            </div>
          )}

          {/* Profile Display Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400" htmlFor="name">
              <User size={13} className="text-indigo-400" />
              Display Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="Nadhem"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border border-white/5"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: '#FFF',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,59,255,0.15)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Workspace Name */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400" htmlFor="workspaceName">
              <Command size={13} className="text-indigo-400" />
              Workspace Name
            </label>
            <input
              id="workspaceName"
              type="text"
              placeholder="My Workspace"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border border-white/5"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: '#FFF',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,59,255,0.15)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          {/* Grid for Timezone and Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Timezone */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400" htmlFor="timezone">
                <Clock size={13} className="text-indigo-400" />
                Timezone
              </label>
              <select
                id="timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border border-white/5 cursor-pointer"
                style={{
                  backgroundColor: '#161F30',
                  color: '#FFF',
                }}
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value} style={{ background: '#0F172A' }}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-400" htmlFor="language">
                <Globe size={13} className="text-indigo-400" />
                Language
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border border-white/5 cursor-pointer"
                style={{
                  backgroundColor: '#161F30',
                  color: '#FFF',
                }}
              >
                {languages.map((lang) => (
                  <option key={lang.value} value={lang.value} style={{ background: '#0F172A' }}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:opacity-95 disabled:scale-100 disabled:opacity-50 glow-primary"
            style={{
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            }}
          >
            {isSubmitting ? (
              <>
                <Loader size={16} className="animate-spin" />
                Setting up workspace...
              </>
            ) : (
              <>
                Let's get started
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Switch to Login Link */}
        <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs">
          <span style={{ color: 'var(--text-muted)' }}>Already have a workspace?</span>
          <Link
            to="/login"
            className="flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Sign in
            <ChevronRight size={12} />
          </Link>
        </div>
      </div>

      {/* Footer Guarantee */}
      <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        ✦ Offline-first & AES-256 encrypted. Your data never leaves your computer.
      </p>
    </div>
  )
}
