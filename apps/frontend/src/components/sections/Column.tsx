import { Droppable } from '@hello-pangea/dnd'
import Card from '../composites/Card'
import ColumnHeader from '../composites/ColumnHeader'
import Input from '../ui/Input'

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

interface Column {
  id: number
  board_id: number
  name: string
  position: number
  created_at: string
  updated_at: string
  items: Item[]
}

interface ColumnProps {
  column: Column
  columnTheme: string
  newItemTitle: string
  onNewItemChange: (value: string) => void
  onCreateItem: () => void
  onCardClick: (item: Item) => void
  onMoveLeft: () => void
  onMoveRight: () => void
  onEdit: () => void
  onDelete: () => void
  movePending: boolean
  updatePending: boolean
  deletePending: boolean
}

export default function Column({
  column,
  columnTheme,
  newItemTitle,
  onNewItemChange,
  onCreateItem,
  onCardClick,
  onMoveLeft,
  onMoveRight,
  onEdit,
  onDelete,
  movePending,
  updatePending,
  deletePending
}: ColumnProps) {
  const columnClasses = columnTheme === 'dark' ? 'bg-black/60' : 'bg-white'
  const inputClasses = columnTheme === 'dark'
    ? 'bg-black/40 border-white/30 text-white placeholder-white/50 focus:bg-black/60 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50 hover:bg-black/50 hover:border-white/40'
    : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-500/50 hover:bg-gray-100 hover:border-gray-400'

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onCreateItem()
    }
  }

  return (
    <div className="flex items-start">
      <Droppable droppableId={column.id.toString()}>
        {(droppableProvided, snapshot) => (
          <div
            ref={droppableProvided.innerRef}
            {...droppableProvided.droppableProps}
            className={`rounded-lg p-2 w-80 transition-all duration-200 border border-gray-200 ${
              snapshot.isDraggingOver ? 'bg-blue-50 border-blue-400' : columnClasses
            }`}
          >
            <ColumnHeader
              column={column}
              columnTheme={columnTheme}
              itemCount={column.items.length}
              onMoveLeft={onMoveLeft}
              onMoveRight={onMoveRight}
              onEdit={onEdit}
              onDelete={onDelete}
              movePending={movePending}
              updatePending={updatePending}
              deletePending={deletePending}
            />

            <div className="space-y-1">
              {column.items
                .sort((a, b) => a.position - b.position)
                .map((item, itemIndex) => (
                  <Card
                    key={item.id}
                    item={item}
                    index={itemIndex}
                    columnTheme={columnTheme}
                    onClick={() => onCardClick(item)}
                  />
                ))}
              {droppableProvided.placeholder}
            </div>

            <div className="mt-2">
              <Input
                type="text"
                placeholder="Add a card..."
                value={newItemTitle}
                onChange={(e) => onNewItemChange(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`w-full px-3 py-2 border rounded-lg text-sm shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${inputClasses}`}
              />
            </div>
          </div>
        )}
      </Droppable>
    </div>
  )
}