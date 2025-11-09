export default function PreferencesSettings() {
  return (
    <div className="space-y-6">
      {/* Preferences */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="notifications"
                name="notifications"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                defaultChecked
              />
              <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                Enable email notifications
              </label>
            </div>
            <div className="flex items-center">
              <input
                id="dark-mode"
                name="dark-mode"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="dark-mode" className="ml-2 block text-sm text-gray-900">
                Dark mode (coming soon)
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}