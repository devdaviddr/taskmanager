import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { Cog6ToothIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

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

  const createColumnMutation = useMutation({
    mutationFn: ({ boardId, name, position }: { boardId: number; name: string; position: number }) =>
      columnsAPI.create(boardId, { name, position }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

  const updateItemMutation = useMutation({
    mutationFn: ({ id, title, description }: { id: number; title: string; description: string }) =>
      itemsAPI.update(id, { title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      handleCloseModal()
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
      // Revert the optimistic update if needed
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

  const handleCreateItem = (columnId: number, title: string) => {
    if (title.trim()) {
      createItemMutation.mutate({ columnId, title: title.trim() })
    }
  }

  const handleCardClick = (item: Item) => {
    setSelectedCard(item)
    setEditTitle(item.title)
    setEditDescription(item.description || '')
    setIsModalOpen(true)
  }

  const handleSaveCard = () => {
    if (selectedCard) {
      updateItemMutation.mutate({
        id: selectedCard.id,
        title: editTitle,
        description: editDescription,
      })
    }
  }

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

  const updateBoardMutation = useMutation({
    mutationFn: ({ id, background, column_theme }: { id: number; background?: string; column_theme?: string }) =>
      boardsAPI.update(id, { background, column_theme }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
      setIsSettingsOpen(false)
    },
    onError: (error) => {
      console.error('Failed to update board:', error)
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
      // Revert the optimistic update if needed
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

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

  const handleChangeBackground = (background: string | undefined) => {
    updateBoardMutation.mutate({ id: boardId, background })
  }

  const handleChangeColumnTheme = (column_theme: string) => {
    updateBoardMutation.mutate({ id: boardId, column_theme })
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCard(null)
    setEditTitle('')
    setEditDescription('')
  }

  const handleItemSubmit = (columnId: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const title = newItemTitles[columnId] || ''
      handleCreateItem(columnId, title)
    }
  }

  const handleAddColumn = (position: number) => {
    const name = prompt('Enter column name:', 'New Column')
    if (name && name.trim()) {
      createColumnMutation.mutate({ boardId, name: name.trim(), position })
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

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    // If no destination or dropped in same position, do nothing
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    if (draggableId.startsWith('column-')) {
      // Column drag
      const columnId = parseInt(draggableId.replace('column-', ''))
      moveColumnMutation.mutate({
        id: columnId,
        position: destination.index,
      })
    } else {
      // Item drag
      const itemId = parseInt(draggableId)
      const destColumnId = parseInt(destination.droppableId)

      // Optimistically update the UI immediately
      moveItemMutation.mutate({
        itemId,
        columnId: destColumnId,
        position: destination.index,
      })
    }
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
  const isDarkBackground = board.background && ['bg-blue-600', 'bg-green-600', 'bg-purple-600', 'bg-red-600'].includes(board.background);

  return (
    <PageLayout background={board.background || 'bg-gray-50'}>
      <div className="w-full h-full flex flex-col">
        <div className="px-6 py-4">
          <PageHeader title={board.name} background={board.background}>
            <div className="relative">
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 rounded-md hover:bg-white/10 transition-colors"
              >
                <Cog6ToothIcon className={`w-5 h-5 ${isDarkBackground ? 'text-white' : 'text-black'}`} />
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">Background Color</div>
                    <button
                      onClick={() => handleChangeBackground('bg-white')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Default (White)
                    </button>
                    <button
                      onClick={() => handleChangeBackground('bg-blue-600')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Blue
                    </button>
                    <button
                      onClick={() => handleChangeBackground('bg-green-600')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Green
                    </button>
                    <button
                      onClick={() => handleChangeBackground('bg-purple-600')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Purple
                    </button>
                    <button
                      onClick={() => handleChangeBackground('bg-red-600')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Red
                    </button>
                    <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b border-t">Column Theme</div>
                    <button
                      onClick={() => handleChangeColumnTheme('dark')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Dark
                    </button>
                    <button
                      onClick={() => handleChangeColumnTheme('light')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Light
                    </button>
                  </div>
                </div>
              )}
            </div>
          </PageHeader>
        </div>

        <div className="flex-1 px-6 pb-6 overflow-x-auto overflow-y-hidden">
          <div className="flex pb-6 min-w-max">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="columns" direction="horizontal">
                {(columnsProvided) => (
                  <div
                    ref={columnsProvided.innerRef}
                    {...columnsProvided.droppableProps}
                    className="flex space-x-6"
                  >
                    {board.columns
                      .sort((a, b) => a.position - b.position)
                      .map((column, index) => (
                        <Draggable key={column.id} draggableId={`column-${column.id}`} index={index}>
                          {(columnProvided) => (
                            <div
                              ref={columnProvided.innerRef}
                              {...columnProvided.draggableProps}
                              {...columnProvided.dragHandleProps}
                              className="flex items-start"
                            >
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
                                                 className={`bg-black/70 p-2 rounded shadow-sm border cursor-move hover:shadow-md transition-all duration-200 ${
                                                   itemSnapshot.isDragging ? 'rotate-2 shadow-xl scale-105 bg-blue-50 border-blue-300' : cardClasses
                                                 }`}
                                                 onClick={() => handleCardClick(item)}
                                               >
                                                 <h4 className={`font-medium ${textClasses} mb-1`}>{item.title}</h4>
                                                 {item.description && (
                                                   <p className={`text-sm ${textClasses}/80`}>{item.description}</p>
                                                 )}
                                                 <div className={`text-xs ${textClasses}/60 mt-1`}>
                                                   {new Date(item.created_at).toLocaleDateString()}
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
                          )}
                        </Draggable>
                      ))}
                    {columnsProvided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <div className="flex items-start ml-6">
              <button
                onClick={() => handleAddColumn(board.columns.length)}
                className={`w-80 h-16 border-2 border-dashed rounded-lg flex items-center justify-center transition-colors bg-transparent ${isDarkBackground ? 'border-white/40 text-white/60 hover:text-white hover:border-white/60' : 'border-black/40 text-black/60 hover:text-black hover:border-black/60'}`}
              >
                + Add Column
              </button>
            </div>
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
    </PageLayout>
  )
}
