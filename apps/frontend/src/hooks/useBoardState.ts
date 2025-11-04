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
  archived: boolean
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
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [editBackground, setEditBackground] = useState('')
  const [editColumnTheme, setEditColumnTheme] = useState('')
  const [editBoardName, setEditBoardName] = useState('')

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCard(null)
    setEditTitle('')
    setEditDescription('')
    setEditStartDate('')
    setEditEndDate('')
    setEditEffort('')
    setEditLabel('')
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
    isSettingsModalOpen,
    setIsSettingsModalOpen,
    editBackground,
    setEditBackground,
    editColumnTheme,
    setEditColumnTheme,
    editBoardName,
    setEditBoardName,
    handleCloseModal,
    handleCloseSettings
  }
}