import { useQuery } from '@tanstack/react-query'
import { healthAPI } from '../services/api'

export default function SystemHealth() {
  const { data: health, isLoading, error } = useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      const response = await healthAPI.get()
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load system health. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Backend Status</h3>
        <p className="mt-1 text-sm text-gray-500">
          Backend is {health?.status || 'unknown'}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900">Database Status</h3>
        <p className="mt-1 text-sm text-gray-500">
          Database: {health?.database || 'unknown'}
        </p>
        {health?.database === 'connected' && (
          <p className="mt-2 text-sm text-gray-500">
            PostgreSQL connection established
          </p>
        )}
      </div>

      {health && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-900">Environment</h4>
            <p className="mt-1 text-sm text-gray-500">{health.environment}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Uptime</h4>
            <p className="mt-1 text-sm text-gray-500">{Math.floor(health.uptime / 3600)}h {Math.floor((health.uptime % 3600) / 60)}m</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Node Version</h4>
            <p className="mt-1 text-sm text-gray-500">{health.version}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900">Last Check</h4>
            <p className="mt-1 text-sm text-gray-500">{new Date(health.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  )
}