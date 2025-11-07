import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DragDropContext } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { CogIcon, PlusIcon } from '@heroicons/react/24/outline'
import PageLayout from '../components/PageLayout'
import PageHeader from '../components/PageHeader'
import { boardsAPI } from '../services/api'
import { useBoardState } from '../hooks/useBoardState'
import { useBoardMutations } from '../hooks/useBoardMutations'
import Column from '../components/sections/Column'
import CardEditModal from '../components/sections/CardEditModal'
import BoardSettingsModal from '../components/sections/BoardSettingsModal'
import AddColumnModal from '../components/sections/AddColumnModal'
import IconButton from '../components/ui/IconButton'
import { validateEffort, validateDate } from '../constants/board'

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
  priority?: 'high' | 'medium' | 'low'
  archived: boolean
  created_at: string
  updated_at: string
}

export default function BoardPage() {
  const { id } = useParams<{ id: string }>()
  const boardId = parseInt(id || '0')

  const boardState = useBoardState()
  const mutations = useBoardMutations(boardId)

  const { data: board, isLoading, error } = useQuery({
    queryKey: ['board', boardId],
    queryFn: async () => {
      const response = await boardsAPI.getWithColumns(boardId)
      return response.data as Board
    },
    enabled: !!boardId,
  })

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

  const handleCreateItem = (columnId: number, title: string) => {
    if (title.trim()) {
      mutations.createItemMutation.mutate({ columnId, title: title.trim() })
      boardState.setNewItemTitles({})
    }
  }

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    const itemId = parseInt(draggableId)
    const destColumnId = parseInt(destination.droppableId)

    mutations.moveItemMutation.mutate({
      itemId,
      columnId: destColumnId,
      position: destination.index,
    })
  }

  const handleCardClick = (item: Item) => {
    boardState.setSelectedCard(item)
    boardState.setEditTitle(item.title)
    boardState.setEditDescription(item.description || '')
    boardState.setEditStartDate(item.start_date ? new Date(item.start_date).toISOString().split('T')[0] : '')
    boardState.setEditEndDate(item.end_date ? new Date(item.end_date).toISOString().split('T')[0] : '')
    boardState.setEditEffort(item.effort?.toString() || '')
    boardState.setEditLabel(item.label || '')
    boardState.setEditPriority(item.priority || '')
    boardState.setIsModalOpen(true)
  }

  const handleSaveCard = () => {
    if (boardState.selectedCard) {
      if (boardState.editStartDate && !validateDate(boardState.editStartDate)) {
        alert('Invalid start date')
        return
      }
      if (boardState.editEndDate && !validateDate(boardState.editEndDate)) {
        alert('Invalid end date')
        return
      }
      
      let effort: number | undefined
      if (boardState.editEffort) {
        effort = validateEffort(boardState.editEffort)
        if (effort === undefined) {
          alert('Effort must be a number 1-10')
          return
        }
      }

      mutations.updateItemMutation.mutate({
        id: boardState.selectedCard.id,
        title: boardState.editTitle,
        description: boardState.editDescription,
        start_date: boardState.editStartDate || undefined,
        end_date: boardState.editEndDate || undefined,
        effort: effort,
        label: boardState.editLabel || undefined,
        priority: boardState.editPriority ? (boardState.editPriority as 'high' | 'medium' | 'low') : null,
      })
      boardState.handleCloseModal()
    }
  }

  const handleDeleteCard = () => {
    if (boardState.selectedCard && window.confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      mutations.deleteItemMutation.mutate(boardState.selectedCard.id)
      boardState.handleCloseModal()
    }
  }

  const handleArchiveCard = () => {
    if (boardState.selectedCard) {
      const shouldArchive = !boardState.selectedCard.archived
      const action = shouldArchive ? 'archive' : 'unarchive'
      if (window.confirm(`Are you sure you want to ${action} this card?`)) {
        mutations.archiveItemMutation.mutate({ id: boardState.selectedCard.id, archived: shouldArchive })
        boardState.handleCloseModal()
      }
    }
  }

  const handleEditColumn = (columnId: number, currentName: string) => {
    boardState.setNewColumnName(currentName)
    boardState.setIsEditingColumn(true)
    boardState.setEditingColumnId(columnId)
    boardState.setIsAddColumnModalOpen(true)
  }

  const handleDeleteColumn = (columnId: number) => {
    if (window.confirm('Are you sure you want to delete this column and all its cards? This action cannot be undone.')) {
      mutations.deleteColumnMutation.mutate(columnId)
    }
  }

  const handleMoveColumnLeft = (column: Column) => {
    if (column.position > 0) {
      mutations.moveColumnMutation.mutate({ id: column.id, position: column.position - 1 })
    }
  }

  const handleMoveColumnRight = (column: Column) => {
    if (column.position < board!.columns.length - 1) {
      mutations.moveColumnMutation.mutate({ id: column.id, position: column.position + 1 })
    }
  }

  const handleOpenSettings = () => {
    boardState.setEditBoardName(board!.name)
    boardState.setEditBackground(board!.background || 'bg-gray-50')
    boardState.setEditColumnTheme(board!.column_theme || 'dark')
    boardState.setIsSettingsModalOpen(true)
  }

  const handleOpenAddColumn = () => {
    boardState.setNewColumnName('')
    boardState.setIsEditingColumn(false)
    boardState.setEditingColumnId(null)
    boardState.setIsAddColumnModalOpen(true)
  }

  const handleSaveSettings = () => {
    mutations.updateBoardMutation.mutate({
      id: board!.id,
      name: boardState.editBoardName,
      background: boardState.editBackground,
      column_theme: boardState.editColumnTheme,
    })
    boardState.handleCloseSettings()
  }

  const handleSaveColumn = () => {
    if (boardState.newColumnName.trim()) {
      if (boardState.isEditingColumn && boardState.editingColumnId) {
        mutations.updateColumnMutation.mutate({ id: boardState.editingColumnId, name: boardState.newColumnName.trim() })
      } else {
        mutations.createColumnMutation.mutate({
          boardId: boardId,
          name: boardState.newColumnName.trim(),
          position: board!.columns.length
        })
      }
      boardState.setIsAddColumnModalOpen(false)
      boardState.setNewColumnName('')
      boardState.setIsEditingColumn(false)
      boardState.setEditingColumnId(null)
    }
  }

  return (
    <PageLayout background={board.background || 'bg-gray-50'}>
      <div className="w-full h-full flex flex-col">
        <div className="px-6 py-4">
          <PageHeader title={board.name} background={board.background}>
            <IconButton icon={CogIcon} onClick={handleOpenSettings} />
          </PageHeader>
        </div>

        <div className="flex-1 px-6 pb-6 overflow-x-auto overflow-y-hidden">
          <div className="flex pb-6 min-w-max">
            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="flex space-x-6">
                {board.columns
                  .sort((a, b) => a.position - b.position)
                  .map((column) => (
                    <Column
                      key={column.id}
                      column={column}
                      columnTheme={board?.column_theme || 'dark'}
                      newItemTitle={boardState.newItemTitles[column.id] || ''}
                      onNewItemChange={(value) => boardState.setNewItemTitles(prev => ({ ...prev, [column.id]: value }))}
                      onCreateItem={() => handleCreateItem(column.id, boardState.newItemTitles[column.id] || '')}
                      onCardClick={handleCardClick}
                      onMoveLeft={() => handleMoveColumnLeft(column)}
                      onMoveRight={() => handleMoveColumnRight(column)}
                      onEdit={() => handleEditColumn(column.id, column.name)}
                      onDelete={() => handleDeleteColumn(column.id)}
                      movePending={mutations.moveColumnMutation.isPending}
                      updatePending={mutations.updateColumnMutation.isPending}
                      deletePending={mutations.deleteColumnMutation.isPending}
                    />
                  ))}
                <div className="flex-shrink-0 w-80">
                  <button
                    onClick={handleOpenAddColumn}
                    className="w-full h-12 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Column
                  </button>
                </div>
              </div>
            </DragDropContext>
          </div>
        </div>
      </div>

      <CardEditModal
        isOpen={boardState.isModalOpen}
        selectedCard={boardState.selectedCard}
        editTitle={boardState.editTitle}
        editDescription={boardState.editDescription}
        editStartDate={boardState.editStartDate}
        editEndDate={boardState.editEndDate}
        editEffort={boardState.editEffort}
        editLabel={boardState.editLabel}
        editPriority={boardState.editPriority}
        onTitleChange={boardState.setEditTitle}
        onDescriptionChange={boardState.setEditDescription}
        onStartDateChange={boardState.setEditStartDate}
        onEndDateChange={boardState.setEditEndDate}
        onEffortChange={boardState.setEditEffort}
        onLabelChange={boardState.setEditLabel}
        onPriorityChange={boardState.setEditPriority}
        onSave={handleSaveCard}
        onDelete={handleDeleteCard}
        onArchive={handleArchiveCard}
        onClose={boardState.handleCloseModal}
        savePending={mutations.updateItemMutation.isPending}
        deletePending={mutations.deleteItemMutation.isPending}
        archivePending={mutations.archiveItemMutation.isPending}
      />

      <BoardSettingsModal
        isOpen={boardState.isSettingsModalOpen}
        editBoardName={boardState.editBoardName}
        editBackground={boardState.editBackground}
        editColumnTheme={boardState.editColumnTheme}
        onNameChange={boardState.setEditBoardName}
        onBackgroundChange={boardState.setEditBackground}
        onThemeChange={boardState.setEditColumnTheme}
        onSave={handleSaveSettings}
        onClose={boardState.handleCloseSettings}
        savePending={mutations.updateBoardMutation.isPending}
      />

      <AddColumnModal
        isOpen={boardState.isAddColumnModalOpen}
        columnName={boardState.newColumnName}
        isEditing={boardState.isEditingColumn}
        onNameChange={boardState.setNewColumnName}
        onSave={handleSaveColumn}
        onClose={() => boardState.setIsAddColumnModalOpen(false)}
        savePending={boardState.isEditingColumn ? mutations.updateColumnMutation.isPending : mutations.createColumnMutation.isPending}
      />
    </PageLayout>
  )
}