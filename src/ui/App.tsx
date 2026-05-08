import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AppLayout from '@/components/layout/AppLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import ErrorBoundary from '@/components/common/ErrorBoundary'

// ─── Auth / Setup ─────────────────────────────────────────────────────────────
const LoginPage          = lazy(() => import('@/pages/auth/LoginPage'))
const SignUpPage          = lazy(() => import('@/pages/auth/SignUpPage'))
const ForgotPasswordPage  = lazy(() => import('@/pages/auth/ForgotPasswordPage'))
const SetupPage           = lazy(() => import('@/pages/setup/SetupPage'))

// ─── App pages ────────────────────────────────────────────────────────────────
const DashboardPage       = lazy(() => import('@/pages/dashboard/DashboardPage'))
const AgentsPage          = lazy(() => import('@/pages/agents/AgentsPage'))
const AnalyzerPage        = lazy(() => import('@/pages/agents/AnalyzerPage'))
const PlannerPage         = lazy(() => import('@/pages/agents/PlannerPage'))
const CreatorPage         = lazy(() => import('@/pages/agents/CreatorPage'))
const ContentStudioPage   = lazy(() => import('@/pages/studio/ContentStudioPage'))
const CalendarPage        = lazy(() => import('@/pages/calendar/CalendarPage'))
const CompetitorsPage     = lazy(() => import('@/pages/competitors/CompetitorsPage'))
const AnalyticsPage       = lazy(() => import('@/pages/analytics/AnalyticsPage'))
const IntegrationsPage    = lazy(() => import('@/pages/integrations/IntegrationsPage'))
const NotificationsPage   = lazy(() => import('@/pages/notifications/NotificationsPage'))
const SettingsPage        = lazy(() => import('@/pages/settings/SettingsPage'))

function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Suspense
          fallback={
            <div
              className="flex h-screen items-center justify-center"
              style={{ backgroundColor: 'var(--bg)' }}
            >
              <LoadingSpinner size="lg" />
            </div>
          }
        >
          <Routes>
            {/* ── Setup / Auth (no sidebar) ── */}
            <Route element={<AuthLayout />}>
              <Route path="/login"           element={<LoginPage />} />
              <Route path="/signup"          element={<SignUpPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/setup"           element={<SetupPage />} />
            </Route>

            {/* ── App (with sidebar) ── */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard"    element={<DashboardPage />} />
                <Route path="/agents"       element={<AgentsPage />} />
                <Route path="/agents/analyzer" element={<AnalyzerPage />} />
                <Route path="/agents/planner"  element={<PlannerPage />} />
                <Route path="/agents/creator"  element={<CreatorPage />} />
                <Route path="/studio"       element={<ContentStudioPage />} />
                <Route path="/calendar"     element={<CalendarPage />} />
                <Route path="/competitors"  element={<CompetitorsPage />} />
                <Route path="/analytics/*"  element={<AnalyticsPage />} />
                <Route path="/integrations" element={<IntegrationsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/settings"     element={<SettingsPage />} />
              </Route>
            </Route>

            {/* ── Default ── */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </HashRouter>
    </ErrorBoundary>
  )
}

export default App
