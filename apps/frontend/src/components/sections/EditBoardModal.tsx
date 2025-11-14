interface EditBoardModalProps {
  isOpen: boolean
  boardName: string
  boardDescription: string
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onSave: () => void
  onClose: () => void
  savePending: boolean
  onDuplicate?: () => void
  onDelete?: () => void
  duplicatePending?: boolean
  deletePending?: boolean
}

export default function EditBoardModal({
  isOpen,
  boardName,
  boardDescription,
  onNameChange,
  onDescriptionChange,
  onSave,
  onClose,
  savePending,
  onDuplicate,
  onDelete,
  duplicatePending,
  deletePending
}: EditBoardModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Edit Board</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Board Name *
            </label>
            <input
              type="text"
              value={boardName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter board name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && onSave()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={boardDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter board description"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex space-x-2">
            {onDuplicate && (
              <button
                onClick={onDuplicate}
                disabled={duplicatePending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {duplicatePending ? 'Duplicating...' : 'Duplicate'}
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                disabled={deletePending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletePending ? 'Deleting...' : 'Delete'}
              </button>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={savePending || !boardName.trim()}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savePending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}