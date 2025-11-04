import ModalHeader from '../composites/ModalHeader'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'

interface Item {
  id: number
  column_id: number
  title: string
  description?: string
  position: number
  start_date?: string
  end_date?: string
  effort?: number
  label?: string
  archived: boolean
  created_at: string
  updated_at: string
}

interface CardEditModalProps {
  isOpen: boolean
  selectedCard: Item | null
  editTitle: string
  editDescription: string
  editStartDate: string
  editEndDate: string
  editEffort: string
  editLabel: string
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onEffortChange: (value: string) => void
  onLabelChange: (value: string) => void
  onSave: () => void
  onDelete: () => void
  onArchive: () => void
  onClose: () => void
  savePending: boolean
  deletePending: boolean
  archivePending: boolean
}

export default function CardEditModal({
  isOpen,
  selectedCard,
  editTitle,
  editDescription,
  editStartDate,
  editEndDate,
  editEffort,
  editLabel,
  onTitleChange,
  onDescriptionChange,
  onStartDateChange,
  onEndDateChange,
  onEffortChange,
  onLabelChange,
  onSave,
  onDelete,
  onArchive,
  onClose,
  savePending,
  deletePending,
  archivePending
}: CardEditModalProps) {
  if (!isOpen || !selectedCard) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
        <ModalHeader title="Edit Card" onClose={onClose} />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              type="text"
              value={editTitle}
              onChange={(e) => onTitleChange(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <Textarea
              value={editDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                type="date"
                value={editStartDate}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <Input
                type="date"
                value={editEndDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <Input
                type="text"
                value={editLabel}
                onChange={(e) => onLabelChange(e.target.value)}
                placeholder="e.g., Bug, Feature"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Effort (1-10)
              </label>
              <Input
                type="number"
                min="1"
                max="10"
                value={editEffort}
                onChange={(e) => onEffortChange(e.target.value)}
                placeholder="1-10"
              />
            </div>
          </div>

          <div className="text-xs text-gray-400">
            Created: {new Date(selectedCard.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="flex justify-between items-center mt-6">
          <div className="flex space-x-2">
            <Button
              variant="danger"
              size="sm"
              onClick={onArchive}
              disabled={archivePending}
            >
              {archivePending ? 'Archiving...' : (selectedCard?.archived ? 'Unarchive' : 'Archive')}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={onDelete}
              disabled={deletePending}
            >
              {deletePending ? 'Deleting...' : 'Delete Card'}
            </Button>
          </div>

          <div className="flex space-x-2">
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
        </div>
      </div>
    </div>
  )
}