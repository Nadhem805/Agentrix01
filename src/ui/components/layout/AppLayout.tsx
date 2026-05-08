import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function AppLayout() {
  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main
          className="flex-1 overflow-auto p-6 animate-fade-in"
          style={{ backgroundColor: 'var(--bg)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
