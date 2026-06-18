import { Navigate, Outlet } from 'react-router-dom'
import { useProfileStore } from '@/stores/profileStore'
import { useAuthStore } from '@/stores/authStore'
import { useEffect, useState } from 'react'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute() {
  const { profile, checkProfile, isLoading } = useProfileStore()
  const { setUser } = useAuthStore()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    checkProfile().then((hasProfile) => {
      if (hasProfile) {
        setUser({
          id: 'local-user',
          email: 'local@agentrix.ai',
          fullName: 'Local User',
          isEmailVerified: true,
          subscriptionStatus: 'active',
          subscriptionPlan: 'pro',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }
      setChecked(true)
    }).catch(err => {
      console.error('Profile check error:', err)
      setChecked(true)
    })
  }, [checkProfile, setUser])

  if (isLoading || !checked) {
    return (
      <div
        className="flex h-screen items-center justify-center animate-fade-in"
        style={{ backgroundColor: 'var(--bg)' }}
      >
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium tracking-wide text-gray-400">Loading your profile workspace...</p>
        </div>
      </div>
    )
  }

  // If no profile exists, redirect to local Free Sign Up screen
  if (!profile) {
    return <Navigate to="/signup" replace />
  }

  return <Outlet />
}
