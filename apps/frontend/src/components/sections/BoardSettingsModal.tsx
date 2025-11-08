import { useState } from 'react'
import ModalHeader from '../composites/ModalHeader'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import IconButton from '../ui/IconButton'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Tag {
  id: number
  name: string
  color: string
  created_at: string
  updated_at: string
}

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
  tags: Tag[]
  newTagName: string
  newTagColor: string
  onNewTagNameChange: (value: string) => void
  onNewTagColorChange: (value: string) => void
  onCreateTag: () => void
  createTagPending: boolean
  editingTagId: number | null
  editTagName: string
  editTagColor: string
  onEditTagNameChange: (value: string) => void
  onEditTagColorChange: (value: string) => void
  onStartEditTag: (tag: Tag) => void
  onSaveEditTag: () => void
  onCancelEditTag: () => void
  onDeleteTag: (id: number) => void
  updateTagPending: boolean
  deleteTagPending: boolean
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
  deletePending,
  tags,
  newTagName,
  newTagColor,
  onNewTagNameChange,
  onNewTagColorChange,
  onCreateTag,
  createTagPending,
  editingTagId,
  editTagName,
  editTagColor,
  onEditTagNameChange,
  onEditTagColorChange,
  onStartEditTag,
  onSaveEditTag,
  onCancelEditTag,
  onDeleteTag,
  updateTagPending,
  deleteTagPending
}: BoardSettingsModalProps) {
  const [selectedTab, setSelectedTab] = useState<'general' | 'tags' | 'danger'>('general')

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[500px] h-[600px] overflow-y-auto shadow-xl">
        <ModalHeader title="Board Settings" onClose={onClose} />

        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('general')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setSelectedTab('tags')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'tags'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Tags
            </button>
            <button
              onClick={() => setSelectedTab('danger')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'danger'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Danger Zone
            </button>
          </nav>
        </div>

        {selectedTab === 'general' && (
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
        )}

        {selectedTab === 'tags' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <div className="w-4 h-4 rounded-full" style={{backgroundColor: tag.color}}></div>
                    {editingTagId === tag.id ? (
                      <>
                        <Input
                          value={editTagName}
                          onChange={(e) => onEditTagNameChange(e.target.value)}
                          className="flex-1"
                        />
                        <Select
                          value={editTagColor}
                          onChange={(e) => onEditTagColorChange(e.target.value)}
                        >
                          <option value="#F3F4F6">Light Gray</option>
                          <option value="#2563EB">Blue</option>
                          <option value="#16A34A">Green</option>
                          <option value="#9333EA">Purple</option>
                          <option value="#DC2626">Red</option>
                        </Select>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={onSaveEditTag}
                          disabled={updateTagPending}
                        >
                          {updateTagPending ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={onCancelEditTag}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1">{tag.name}</span>
                        <IconButton
                          icon={PencilIcon}
                          onClick={() => onStartEditTag(tag)}
                          size="sm"
                        />
                        <IconButton
                          icon={TrashIcon}
                          onClick={() => onDeleteTag(tag.id)}
                          size="sm"
                          disabled={deleteTagPending}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex space-x-2 mt-2">
                <Input
                  value={newTagName}
                  onChange={(e) => onNewTagNameChange(e.target.value)}
                  placeholder="New tag name"
                  className="flex-1"
                />
                <Select
                  value={newTagColor}
                  onChange={(e) => onNewTagColorChange(e.target.value)}
                >
                  <option value="#F3F4F6">Light Gray</option>
                  <option value="#2563EB">Blue</option>
                  <option value="#16A34A">Green</option>
                  <option value="#9333EA">Purple</option>
                  <option value="#DC2626">Red</option>
                </Select>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onCreateTag}
                  disabled={createTagPending}
                >
                  {createTagPending ? 'Adding...' : 'Add'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'danger' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-800 mb-4">
              <strong>Danger Zone</strong> - These actions cannot be undone.
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
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                {deletePending ? 'Deleting...' : 'Delete Board'}
              </Button>
            </div>
          </div>
        )}

        {selectedTab === 'general' && (
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
        )}

        {selectedTab === 'danger' && (
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}