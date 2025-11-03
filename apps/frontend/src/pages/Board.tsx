import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import PageLayout from '../components/PageLayout'
import PageHeader from '../components/PageHeader'
import { boardsAPI, itemsAPI } from '../services/api'

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
  created_at: string
  updated_at: string
}

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const boardId = parseInt(id || '0')

  const [newItemTitles, setNewItemTitles] = useState<Record<number, string>>({})

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
      // Re-fetch data to revert any optimistic updates
      queryClient.invalidateQueries({ queryKey: ['board', boardId] })
    },
  })

  const handleCreateItem = (columnId: number, title: string) => {
    if (title.trim()) {
      createItemMutation.mutate({ columnId, title: title.trim() })
    }
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    // If no destination or dropped in same position, do nothing
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    const itemId = parseInt(draggableId)
    const destColumnId = parseInt(destination.droppableId)

    // Optimistically update the UI immediately
    // Move item to new position
    moveItemMutation.mutate({
      itemId,
      columnId: destColumnId,
      position: destination.index,
    })
  }

  const handleItemSubmit = (columnId: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const title = newItemTitles[columnId] || ''
      handleCreateItem(columnId, title)
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

      <div className="flex space-x-6 pb-6 bg-white">
        <DragDropContext onDragEnd={handleDragEnd}>
          {board.columns
            .sort((a, b) => a.position - b.position)
            .map((column) => (
              <Droppable key={column.id} droppableId={column.id.toString()}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-white rounded-lg p-2 w-80 h-[30vh] transition-all duration-200 border-2 ${
                      snapshot.isDraggingOver ? 'border-blue-400 shadow-inner' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{column.name}</h3>
                      <span className="text-sm text-gray-500">{column.items.length}</span>
                    </div>

                    <div className="space-y-1">
                      {column.items
                        .sort((a, b) => a.position - b.position)
                        .map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white p-2 rounded shadow-sm border cursor-move hover:shadow-md transition-all duration-200 ${
                                  snapshot.isDragging ? 'rotate-2 shadow-xl scale-105 bg-blue-50 border-blue-300' : ''
                                }`}
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
                )}
              </Droppable>
            ))}
        </DragDropContext>
      </div>
    </PageLayout>
  )
}