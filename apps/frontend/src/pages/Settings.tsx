import { Outlet, useLocation, Link } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import PageHeader from '../components/PageHeader'

const SettingsLayout = () => {
  const location = useLocation()

  const tabs = [
    { name: 'Account', href: '/app/settings', current: location.pathname === '/app/settings' },
    { name: 'Preferences', href: '/app/settings/preferences', current: location.pathname === '/app/settings/preferences' },
  ]

  return (
    <PageLayout>
      <div className="px-6 py-4">
        <PageHeader title="Settings" />
      </div>

      <div className="px-6 pb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                to={tab.href}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  tab.current
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-8">
          <Outlet />
        </div>
      </div>
    </PageLayout>
  )
}

export default SettingsLayout
