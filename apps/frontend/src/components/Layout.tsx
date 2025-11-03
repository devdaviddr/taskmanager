import { Outlet, Link } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-gray-200 h-16">
        <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center">
          <Link to="/app" className="text-xl font-bold text-gray-900">
            TaskManager
          </Link>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-x-auto overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}