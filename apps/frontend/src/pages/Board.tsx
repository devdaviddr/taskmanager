import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon, CogIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import PageLayout from '../components/PageLayout'
import PageHeader from '../components/PageHeader'
import { boardsAPI, itemsAPI, columnsAPI } from '../services/api'

interface Board {
  id: number
  name: string
  description?: string
  background?: string
  column_theme?: string
  user_id: number
  created_at: string
  updated_at: string
  columns: Column[]
}

interface Column {
  id: number
  board_id: number
  name: string
  position: number
  created_at: string
  updated_at: string
  items: Item[]
}

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

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const boardId = parseInt(id || '0')

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

  const { data: board, isLoading, error } = useQuery({
    queryKey: ['board', boardId],
    queryFn: async () => {
      const response = await boardsAPI.getWithColumns(boardId)
      return response.data as Board
    },
    enabled: !!boardId,
  })

  const createItemMutation = useMutation({
    mutationFn: ({ columnId, title }: { columnId: number; title: string }) =>
      itemsAPI.create(columnId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      setNewItemTitles({})
    },
  })

  const moveItemMutation = useMutation({
    mutationFn: ({ itemId, columnId, position }: { itemId: number; columnId: number; position: number }) =>
      itemsAPI.move(itemId, { column_id: columnId, position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: (error) => {
      console.error('Failed to move item:', error)
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ id, title, description, start_date, end_date, effort, label }: { id: number; title: string; description: string; start_date?: string; end_date?: string; effort?: number; label?: string }) =>
      itemsAPI.update(id, { title, description, start_date, end_date, effort, label }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      handleCloseModal()
    },
  })

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => itemsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      handleCloseModal()
    },
    onError: (error) => {
      console.error('Failed to delete item:', error)
    },
  })

  const archiveItemMutation = useMutation({
    mutationFn: ({ id, archived }: { id: number; archived: boolean }) => itemsAPI.archive(id, archived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      handleCloseModal()
    },
    onError: (error) => {
      console.error('Failed to archive item:', error)
    },
  })

  const updateColumnMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      columnsAPI.update(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: (error) => {
      console.error('Failed to update column:', error)
    },
  })

  const deleteColumnMutation = useMutation({
    mutationFn: (id: number) => columnsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: (error) => {
      console.error('Failed to delete column:', error)
    },
  })

  const moveColumnMutation = useMutation({
    mutationFn: ({ id, position }: { id: number; position: number }) =>
      columnsAPI.move(id, position),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
    onError: (error) => {
      console.error('Failed to move column:', error)
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

  const updateBoardMutation = useMutation({
    mutationFn: ({ id, name, background, column_theme }: { id: number; name?: string; background?: string; column_theme?: string }) =>
      boardsAPI.update(id, { name, background, column_theme }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      setIsSettingsModalOpen(false)
    },
    onError: (error) => {
      console.error('Failed to update board:', error)
    },
  })

  const handleCreateItem = (columnId: number, title: string) => {
    if (title.trim()) {
      createItemMutation.mutate({ columnId, title: title.trim() })
    }
  }

  const handleItemSubmit = (columnId: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const title = newItemTitles[columnId] || ''
      handleCreateItem(columnId, title)
    }
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    const itemId = parseInt(draggableId)
    const destColumnId = parseInt(destination.droppableId)

    moveItemMutation.mutate({
      itemId,
      columnId: destColumnId,
      position: destination.index,
    })
  }

  const handleCardClick = (item: Item) => {
    setSelectedCard(item)
    setEditTitle(item.title)
    setEditDescription(item.description || '')
    setEditStartDate(item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : '')
    setEditEndDate(item.end_date ? new Date(item.end_date).toISOString().split('T')[0] : '')
    setEditEffort(item.effort?.toString() || '')
    setEditLabel(item.label || '')
    setIsModalOpen(true)
  }

  const handleSaveCard = () => {
    if (selectedCard) {
      // Validate dates
      if (editStartDate && isNaN(new Date(editStartDate).getTime())) {
        alert('Invalid start date')
        return
      }
      if (editEndDate && isNaN(new Date(editEndDate).getTime())) {
        alert('Invalid end date')
        return
      }
      
      let effort: number | undefined
      if (editEffort) {
        const parsed = parseInt(editEffort)
        if (isNaN(parsed)) {
          alert('Effort must be a number')
          return
        }
        effort = parsed
      }

      updateItemMutation.mutate({
        id: selectedCard.id,
        title: editTitle,
        description: editDescription,
        start_date: editStartDate || undefined,
        end_date: editEndDate || undefined,
        effort: effort,
        label: editLabel || undefined,
      })
    }
  }

  const handleDeleteCard = () => {
    if (selectedCard && window.confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      deleteItemMutation.mutate(selectedCard.id)
    }
  }

  const handleArchiveCard = () => {
    if (selectedCard) {
      const shouldArchive = !selectedCard.archived
      const action = shouldArchive ? 'archive' : 'unarchive'
      if (window.confirm(`Are you sure you want to ${action} this card?`)) {
        archiveItemMutation.mutate({ id: selectedCard.id, archived: shouldArchive })
      }
    }
  }

  const handleEditColumn = (columnId: number, currentName: string) => {
    const name = prompt('Edit column name:', currentName)
    if (name && name.trim() && name.trim() !== currentName) {
      updateColumnMutation.mutate({ id: columnId, name: name.trim() })
    }
  }

  const handleDeleteColumn = (columnId: number) => {
    if (window.confirm('Are you sure you want to delete this column and all its cards? This action cannot be undone.')) {
      deleteColumnMutation.mutate(columnId)
    }
  }

  const handleMoveColumnLeft = (column: Column) => {
    if (column.position > 0) {
      moveColumnMutation.mutate({ id: column.id, position: column.position - 1 })
    }
  }

  const handleMoveColumnRight = (column: Column) => {
    if (column.position < board!.columns.length - 1) {
      moveColumnMutation.mutate({ id: column.id, position: column.position + 1 })
    }
  }

  const handleOpenSettings = () => {
    setEditBoardName(board!.name)
    setEditBackground(board!.background || 'bg-gray-50')
    setEditColumnTheme(board!.column_theme || 'dark')
    setIsSettingsModalOpen(true)
  }

  const handleSaveSettings = () => {
    updateBoardMutation.mutate({
      id: board!.id,
      name: editBoardName,
      background: editBackground,
      column_theme: editColumnTheme,
    })
  }

  const handleCloseSettings = () => {
    setIsSettingsModalOpen(false)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCard(null)
    setEditTitle('')
    setEditDescription('')
  }

  if (isLoading) {
    return (
      <PageLayout>
        <PageHeader title="Loading..." />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    )
  }

  if (error || !board) {
    return (
      <PageLayout>
        <PageHeader title="Error" />
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load board. Please try again.</p>
        </div>
      </PageLayout>
    )
  }

  const columnTheme = board?.column_theme || 'dark'
  const columnClasses = columnTheme === 'dark' ? 'bg-black/60' : 'bg-white'
  const cardClasses = columnTheme === 'dark' ? 'bg-black/70' : 'bg-white'
  const textClasses = columnTheme === 'dark' ? 'text-white' : 'text-black'
  const inputClasses = columnTheme === 'dark' 
    ? 'bg-black/40 border-white/30 text-white placeholder-white/50 focus:bg-black/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50 hover:bg-black/50 hover:border-white/40' 
    : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50 hover:bg-gray-100 hover:border-gray-400'

  return (
    <PageLayout background={board.background || 'bg-gray-50'}>
      <div className="w-full h-full flex flex-col">
        <div className="px-6 py-4">
          <PageHeader title={board.name} background={board.background}>
            <button
              onClick={handleOpenSettings}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white"
            >
              <CogIcon className="w-5 h-5" />
            </button>
          </PageHeader>
        </div>

        <div className="flex-1 px-6 pb-6 overflow-x-auto overflow-y-hidden">
          <div className="flex pb-6 min-w-max">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex space-x-6">
                {board.columns
                  .sort((a, b) => a.position - b.position)
                  .map((column) => (
                    <div key={column.id} className="flex items-start">
                      <Droppable droppableId={column.id.toString()}>
                        {(droppableProvided, snapshot) => (
                          <div
                            ref={droppableProvided.innerRef}
                            {...droppableProvided.droppableProps}
                            className={`rounded-lg p-2 w-80 transition-all duration-200 border border-gray-200 ${
                              snapshot.isDraggingOver ? 'bg-blue-50 border-blue-400' : columnClasses
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <h3 className={`font-semibold ${textClasses}`}>{column.name}</h3>
                              </div>
                               <div className="flex items-center space-x-1">
                                 <button
                                   onClick={() => handleMoveColumnLeft(column)}
                                   disabled={moveColumnMutation.isPending || column.position === 0}
                                   className={`p-1 rounded hover:bg-white/10 transition-colors ${textClasses}/60 hover:${textClasses} disabled:opacity-30 disabled:cursor-not-allowed`}
                                 >
                                   <ChevronLeftIcon className="w-4 h-4" />
                                 </button>
                                 <button
                                   onClick={() => handleMoveColumnRight(column)}
                                   disabled={moveColumnMutation.isPending || column.position === board!.columns.length - 1}
                                   className={`p-1 rounded hover:bg-white/10 transition-colors ${textClasses}/60 hover:${textClasses} disabled:opacity-30 disabled:cursor-not-allowed`}
                                 >
                                   <ChevronRightIcon className="w-4 h-4" />
                                 </button>
                                 <button
                                   onClick={() => handleEditColumn(column.id, column.name)}
                                   disabled={updateColumnMutation.isPending}
                                   className={`p-1 rounded hover:bg-white/10 transition-colors ${textClasses}/60 hover:${textClasses}`}
                                 >
                                   <PencilIcon className="w-4 h-4" />
                                 </button>
                                 <button
                                   onClick={() => handleDeleteColumn(column.id)}
                                   disabled={deleteColumnMutation.isPending}
                                   className={`p-1 rounded hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300`}
                                 >
                                   <TrashIcon className="w-4 h-4" />
                                 </button>
                                 <span className={`text-sm ${textClasses}/80`}>{column.items.length}</span>
                               </div>
                            </div>

                            <div className="space-y-1">
                              {column.items
                                .sort((a, b) => a.position - b.position)
                                .map((item, itemIndex) => (
                                  <Draggable key={item.id} draggableId={item.id.toString()} index={itemIndex}>
                                    {(itemProvided, itemSnapshot) => (
                                      <div
                                        ref={itemProvided.innerRef}
                                        {...itemProvided.draggableProps}
                                        {...itemProvided.dragHandleProps}
                                        className={`${cardClasses} p-2 rounded-lg border border-gray-200 shadow-sm cursor-move hover:shadow-md transition-all duration-150 ${
                                          itemSnapshot.isDragging 
                                            ? 'shadow-xl opacity-95 border-blue-400 ring-2 ring-blue-400/50' 
                                            : 'hover:border-gray-300 hover:shadow-md'
                                        }`}
                                        onClick={() => handleCardClick(item)}
                                      >
                                        <div className="space-y-1.5">
                                          <h4 className={`font-semibold text-xs leading-tight ${textClasses}`}>{item.title}</h4>

                                          {item.description && (
                                            <p className={`text-xs ${textClasses}/70 leading-relaxed line-clamp-1`}>{item.description}</p>
                                          )}

                                          <div className="flex flex-wrap gap-1">
                                            {item.label && (
                                              <span className="inline-block bg-blue-500/20 text-blue-600 text-xs px-1.5 py-0.5 rounded font-medium">
                                                {item.label}
                                              </span>
                                            )}
                                            {item.effort !== undefined && (
                                              <span className="inline-block bg-green-500/20 text-green-700 text-xs px-1.5 py-0.5 rounded font-medium">
                                                ⚡{item.effort}
                                              </span>
                                            )}
                                          </div>

                                          {(item.start_date || item.end_date) && (
                                            <div className="flex items-center gap-2 pt-1 border-t border-gray-200/50">
                                              {item.start_date && (
                                                <span className={`${textClasses}/60 text-xs`}>start: {new Date(item.start_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</span>
                                              )}
                                              {item.end_date && (
                                                <span className={`${textClasses}/60 text-xs`}>end: {new Date(item.end_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}</span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                              {droppableProvided.placeholder}
                            </div>

                            <div className="mt-2">
                              <input
                                type="text"
                                placeholder="Add a card..."
                                value={newItemTitles[column.id] || ''}
                                onChange={(e) => setNewItemTitles(prev => ({ ...prev, [column.id]: e.target.value }))}
                                onKeyPress={(e) => handleItemSubmit(column.id, e)}
                                className={`w-full px-3 py-2 border rounded-lg text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClasses}`}
                              />
                            </div>
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
              </div>
            </DragDropContext>
          </div>
        </div>
      </div>

      {/* Card Edit Modal */}
      {isModalOpen && selectedCard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Edit Card</h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Bug, Feature"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Effort (1-10)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editEffort}
                    onChange={(e) => setEditEffort(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <button
                  onClick={handleArchiveCard}
                  disabled={archiveItemMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-300 rounded-md hover:bg-orange-100 disabled:opacity-50"
                >
                  {archiveItemMutation.isPending ? 'Archiving...' : (selectedCard?.archived ? 'Unarchive' : 'Archive')}
                </button>
                <button
                  onClick={handleDeleteCard}
                  disabled={deleteItemMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 disabled:opacity-50"
                >
                  {deleteItemMutation.isPending ? 'Deleting...' : 'Delete Card'}
                </button>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCard}
                  disabled={updateItemMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateItemMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Board Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Board Settings</h2>
              <button
                onClick={handleCloseSettings}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Board Name
                </label>
                <input
                  type="text"
                  value={editBoardName}
                  onChange={(e) => setEditBoardName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter board name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Background Color
                </label>
                <div className="relative">
                  <select
                    value={editBackground}
                    onChange={(e) => setEditBackground(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer"
                  >
                    <option value="bg-gray-50">Light Gray</option>
                    <option value="bg-blue-600">Blue</option>
                    <option value="bg-green-600">Green</option>
                    <option value="bg-purple-600">Purple</option>
                    <option value="bg-red-600">Red</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Column Theme
                </label>
                <div className="relative">
                  <select
                    value={editColumnTheme}
                    onChange={(e) => setEditColumnTheme(e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={handleCloseSettings}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={updateBoardMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {updateBoardMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  )
}