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

export function useBoardState() {
  const [newItemTitles, setNewItemTitles] = useState<Record<number, string>>({})
  const [selectedCard, setSelectedCard] = useState<Item | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editStartDate, setEditStartDate] = useState('')
  const [editEndDate, setEditEndDate] = useState('')
  const [editEffort, setEditEffort] = useState('')
  const [editLabel, setEditLabel] = useState('')
  const [editPriority, setEditPriority] = useState('')
  const [editTags, setEditTags] = useState<Tag[]>([])
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [editBackground, setEditBackground] = useState('')
  const [editColumnTheme, setEditColumnTheme] = useState('')
  const [editBoardName, setEditBoardName] = useState('')
  const [editArchived, setEditArchived] = useState(false)
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [isEditingColumn, setIsEditingColumn] = useState(false)
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null)

  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#F3F4F6')
  const [editingTagId, setEditingTagId] = useState<number | null>(null)
  const [editTagName, setEditTagName] = useState('')
  const [editTagColor, setEditTagColor] = useState('gray')

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCard(null)
    setEditTitle('')
    setEditDescription('')
    setEditStartDate('')
    setEditEndDate('')
    setEditEffort('')
    setEditLabel('')
    setEditPriority('')
    setEditTags([])
  }

  const handleCloseSettings = () => {
    setIsSettingsModalOpen(false)
  }

  return {
    newItemTitles,
    setNewItemTitles,
    selectedCard,
    setSelectedCard,
    isModalOpen,
    setIsModalOpen,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    editStartDate,
    setEditStartDate,
    editEndDate,
    setEditEndDate,
    editEffort,
    setEditEffort,
    editLabel,
    setEditLabel,
    editPriority,
    setEditPriority,
    editTags,
    setEditTags,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    editBackground,
    setEditBackground,
    editColumnTheme,
    setEditColumnTheme,
    editBoardName,
    setEditBoardName,
    editArchived,
    setEditArchived,
    isAddColumnModalOpen,
    setIsAddColumnModalOpen,
    newColumnName,
    setNewColumnName,
    isEditingColumn,
    setIsEditingColumn,
    editingColumnId,
    setEditingColumnId,
    newTagName,
    setNewTagName,
    newTagColor,
    setNewTagColor,
    editingTagId,
    setEditingTagId,
    editTagName,
    setEditTagName,
    editTagColor,
    setEditTagColor,
    handleCloseModal,
    handleCloseSettings
  }
}