import { Outlet } from 'react-router-dom'
import DarkVeil from '@/components/common/DarkVeil'

export default function AuthLayout() {
  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      {/* DarkVeil background — fills the entire screen */}
      <div className="absolute inset-0">
        <DarkVeil
          hueShift={0}
          noiseIntensity={0.12}
          scanlineIntensity={0.06}
          speed={2.2}
          scanlineFrequency={5}
          warpAmount={3.0}
        />
      </div>

      {/* Subtle dark overlay so the form stays readable */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(14,14,18,0.45)' }}
      />

      {/* Page content (LoginPage, SignUpPage, etc.) */}
      <div className="relative z-10 flex w-full items-center justify-center">
        <Outlet />
      </div>
    </div>
  )
}
