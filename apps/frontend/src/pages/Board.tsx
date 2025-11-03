import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import PageLayout from '../components/PageLayout'
import PageHeader from '../components/PageHeader'
import { boardsAPI, itemsAPI, columnsAPI } from '../services/api'

interface Board {
  id: number
  name: string
  description?: string
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

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    // If no destination or dropped in same position, do nothing
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    if (draggableId.startsWith('column-')) {
      // Column drag
      const columnId = parseInt(draggableId.replace('column-', ''))
      moveColumnMutation.mutate({ id: columnId, position: destination.index })
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
        <PageHeader title="Loading..." description="Loading board data" />
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </PageLayout>
    )
  }

  if (error || !board) {
    return (
      <PageLayout>
        <PageHeader title="Error" description="Failed to load board" />
        <div className="text-center py-12">
          <p className="text-red-600">Failed to load board. Please try again.</p>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="mb-6">
        <PageHeader title={board.name} description={board.description || 'Manage your board tasks'} />
      </div>

      <div className="overflow-x-auto">
        <div className="flex pb-6 bg-white min-w-max">
          <button
            onClick={() => handleAddColumn(0)}
            className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mr-6"
          >
            +
          </button>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="columns" direction="horizontal">
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="flex space-x-6">
                  {board.columns
                    .sort((a, b) => a.position - b.position)
                    .map((column, index) => (
                      <Draggable key={column.id} draggableId={`column-${column.id}`} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} className="flex items-start">
                            <div className="bg-white rounded-lg p-2 w-80 transition-all duration-200">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center">
                                  <div {...provided.dragHandleProps} className="cursor-move mr-2 text-gray-400 hover:text-gray-600">
                                    ⋮⋮
                                  </div>
                                  <h3 className="font-semibold text-gray-900">{column.name}</h3>
                                </div>
                                <span className="text-sm text-gray-500">{column.items.length}</span>
                              </div>

                              <Droppable key={column.id} droppableId={column.id.toString()}>
                                {(provided) => (
                                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-1">
                                    {column.items
                                      .sort((a, b) => a.position - b.position)
                                      .map((item, itemIndex) => (
                                        <Draggable key={item.id} draggableId={item.id.toString()} index={itemIndex}>
                                          {(provided, snapshot) => (
                                            <div
                                              ref={provided.innerRef}
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              className={`bg-white p-2 rounded shadow-sm border cursor-move hover:shadow-md transition-all duration-200 ${
                                                snapshot.isDragging ? 'rotate-2 shadow-xl scale-105 bg-blue-50 border-blue-300' : ''
                                              }`}
                                              onClick={() => handleCardClick(item)}
                                            >
                                              <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                                              {item.description && (
                                                <p className="text-sm text-gray-600">{item.description}</p>
                                              )}
                                              <div className="text-xs text-gray-400 mt-1">
                                                {new Date(item.created_at).toLocaleDateString()}
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                    {provided.placeholder}
                                  </div>
                                )}
                              </Droppable>

                              <div className="mt-2">
                                <input
                                  type="text"
                                  placeholder="Add a card..."
                                  value={newItemTitles[column.id] || ''}
                                  onChange={(e) => setNewItemTitles(prev => ({ ...prev, [column.id]: e.target.value }))}
                                  onKeyPress={(e) => handleItemSubmit(column.id, e)}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddColumn(column.position + 1)}
                              className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-6"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
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