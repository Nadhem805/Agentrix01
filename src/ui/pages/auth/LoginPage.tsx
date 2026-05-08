import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import type { User } from '@/types/auth'
import logo from '@/assets/logo.png'

// Demo user — remove when real auth is wired up in Phase 2
const DEMO_USER: User = {
  id: 'demo-001',
  email: 'nadhem@agentrix.io',
  fullName: 'Nadhem',
  isEmailVerified: true,
  subscriptionStatus: 'active',
  subscriptionPlan: 'pro',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export default function LoginPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((s) => s.setUser)

  function handleDemoLogin() {
    setUser(DEMO_USER)
    navigate('/dashboard')
  }

  return (
    <div className="w-full max-w-sm animate-fade-in space-y-8 px-2">

      {/* Logo */}
      <div className="text-center">
        <img
          src={logo}
          alt="Agentrix"
          className="mx-auto mb-4 h-16 w-16 rounded-2xl object-contain"
        />
        <h1 className="gradient-text text-2xl font-bold tracking-tight">Agentrix</h1>
        <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
          Sign in to your workspace
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-6 space-y-5"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border)',
        }}
      >
        {/* Email */}
        <div className="space-y-1.5">
          <label
            className="block text-xs font-medium"
            style={{ color: 'var(--text-muted)' }}
            htmlFor="email"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,59,255,0.15)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              className="block text-xs font-medium"
              style={{ color: 'var(--text-muted)' }}
              htmlFor="password"
            >
              Password
            </label>
  
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none transition-all"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(108,59,255,0.15)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />

        </div>

        {/* Sign in button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 glow-primary"
          style={{ background: 'linear-gradient(135deg, var(--primary), var(--accent))' }}
        >
          Sign in
        </button>
        <div className="space-y-0.8">                         
            <a
              href="/forgot-password"
              className="text-xs transition-colors hover:opacity-80"
              style={{ color: 'var(--secondary)' }}
            >
              Forgot password?
            </a>
          </div>
  
        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
          <div className="h-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
        </div>

        {/* Demo access */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full rounded-lg py-2.5 text-sm font-medium transition-all hover:opacity-80"
          style={{
            backgroundColor: 'var(--bg-hover)',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
          }}
        >
          Continue as Demo ✦
        </button>
      </div>

      {/* Footer */}
      <p className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        Don't have an account?{' '}
        <a
          href="/signup"
          className="font-semibold transition-colors hover:opacity-80"
          style={{ color: 'var(--secondary)' }}
        >
          Sign up free
        </a>
      </p>
    </div>
  )
}
