import ModalHeader from '../composites/ModalHeader'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'

interface BoardSettingsModalProps {
  isOpen: boolean
  editBoardName: string
  editBackground: string
  editColumnTheme: string
  onNameChange: (value: string) => void
  onBackgroundChange: (value: string) => void
  onThemeChange: (value: string) => void
  onSave: () => void
  onClose: () => void
  onArchive: () => void
  onDelete: () => void
  savePending: boolean
  archivePending: boolean
  deletePending: boolean
}

export default function BoardSettingsModal({
  isOpen,
  editBoardName,
  editBackground,
  editColumnTheme,
  onNameChange,
  onBackgroundChange,
  onThemeChange,
  onSave,
  onClose,
  onArchive,
  onDelete,
  savePending,
  archivePending,
  deletePending
}: BoardSettingsModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <ModalHeader title="Board Settings" onClose={onClose} />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Board Name
            </label>
            <Input
              type="text"
              value={editBoardName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter board name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Background Color
            </label>
            <Select
              value={editBackground}
              onChange={(e) => onBackgroundChange(e.target.value)}
            >
              <option value="bg-gray-50">Light Gray</option>
              <option value="bg-blue-600">Blue</option>
              <option value="bg-green-600">Green</option>
              <option value="bg-purple-600">Purple</option>
              <option value="bg-red-600">Red</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Column Theme
            </label>
            <Select
              value={editColumnTheme}
              onChange={(e) => onThemeChange(e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </Select>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onSave}
            disabled={savePending}
          >
            {savePending ? 'Saving...' : 'Save'}
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500 mb-2">
            Danger zone
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onArchive}
              disabled={archivePending}
              className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
            >
              {archivePending ? 'Archiving...' : 'Archive Board'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onDelete}
              disabled={deletePending}
              className="bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500"
            >
              {deletePending ? 'Deleting...' : 'Delete Board'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}