import { Outlet, Link } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="min-h-screen">
      <nav className="bg-white">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex h-16">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/app" className="text-xl font-bold text-gray-900">
                TaskManager
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 overflow-x-auto overflow-y-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}