import ModalHeader from '../composites/ModalHeader'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Textarea from '../ui/Textarea'
import Select from '../ui/Select'
import { useState } from 'react'

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
  priority?: 'high' | 'medium' | 'low'
  tags?: Tag[]
  archived: boolean
  created_at: string
  updated_at: string
}

interface Tag {
  id: number
  name: string
  color: string
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
  editPriority: string
  editTags: Tag[]
  availableTags: Tag[]
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onStartDateChange: (value: string) => void
  onEndDateChange: (value: string) => void
  onEffortChange: (value: string) => void
  onLabelChange: (value: string) => void
  onPriorityChange: (value: string) => void
  onTagsChange: (tags: Tag[]) => void
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
  editPriority,
  editTags,
  availableTags,
  onTitleChange,
  onDescriptionChange,
  onStartDateChange,
  onEndDateChange,
  onEffortChange,
  onLabelChange,
  onPriorityChange,
  onTagsChange,
  onSave,
  onDelete,
  onArchive,
  onClose,
  savePending,
  deletePending,
  archivePending
}: CardEditModalProps) {
  const [tagInput, setTagInput] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const filteredTags = tagInput
    ? availableTags.filter(tag => tag.name.toLowerCase().includes(tagInput.toLowerCase()) && !editTags.find(t => t.id === tag.id))
    : availableTags.filter(tag => !editTags.find(t => t.id === tag.id))

  if (!isOpen || !selectedCard) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 shadow-xl">
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

          <div className="grid grid-cols-3 gap-2">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <Select
                value={editPriority}
                onChange={(e) => onPriorityChange(e.target.value)}
              >
                <option value="">None</option>
                <option value="high">High (^^^)</option>
                <option value="medium">Medium (^^)</option>
                <option value="low">Low (^)</option>
              </Select>
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {editTags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-flex items-center text-xs px-2 py-1 rounded-full text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                  <button
                    type="button"
                    onClick={() => onTagsChange(editTags.filter(t => t.id !== tag.id))}
                    className="ml-1 text-white hover:text-gray-200"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => {
                setTagInput(e.target.value)
                setShowDropdown(true)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const trimmed = tagInput.trim()
                  if (trimmed) {
                    const existing = availableTags.find(t => t.name.toLowerCase() === trimmed.toLowerCase())
                    if (existing && !editTags.find(t => t.id === existing.id)) {
                      onTagsChange([...editTags, existing])
                    } else if (!existing) {
                      const tempTag = {
                        id: Date.now(),
                        name: trimmed,
                        color: '#3B82F6',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      }
                      onTagsChange([...editTags, tempTag])
                    }
                    setTagInput('')
                    setShowDropdown(false)
                  }
                }
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 100)}
              placeholder="Type to add or create tag..."
            />
            {showDropdown && (
              <div className="absolute z-[60] bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto w-full mt-1">
                {filteredTags.length > 0 ? (
                  filteredTags.map(tag => (
                    <div
                      key={tag.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => {
                        onTagsChange([...editTags, tag])
                        setTagInput('')
                        setShowDropdown(false)
                      }}
                    >
                      <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: tag.color }}></span>
                      {tag.name}
                    </div>
                  ))
                ) : tagInput ? (
                  <div className="px-3 py-2 text-gray-500">No matching tags</div>
                ) : null}
              </div>
            )}
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