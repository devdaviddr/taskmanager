import { PencilIcon, TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import IconButton from '../ui/IconButton'

interface Column {
  id: number
  board_id: number
  name: string
  position: number
  created_at: string
  updated_at: string
  items: any[] // simplified
}

interface ColumnHeaderProps {
  column: Column
  columnTheme: string
  itemCount: number
  onMoveLeft: () => void
  onMoveRight: () => void
  onEdit: () => void
  onDelete: () => void
  movePending: boolean
  updatePending: boolean
  deletePending: boolean
}

export default function ColumnHeader({
  column,
  columnTheme,
  itemCount,
  onMoveLeft,
  onMoveRight,
  onEdit,
  onDelete,
  movePending,
  updatePending,
  deletePending
}: ColumnHeaderProps) {
  const textClasses = columnTheme === 'dark' ? 'text-white' : 'text-black'

  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <h3 className={`font-semibold ${textClasses}`}>{column.name}</h3>
      </div>
      <div className="flex items-center space-x-1">
        <IconButton
          icon={ChevronLeftIcon}
          onClick={onMoveLeft}
          disabled={movePending || column.position === 0}
          className={`p-1 rounded hover:bg-white/10 transition-colors ${textClasses}/60 hover:${textClasses} disabled:opacity-30 disabled:cursor-not-allowed`}
        />
        <IconButton
          icon={ChevronRightIcon}
          onClick={onMoveRight}
          disabled={movePending}
          className={`p-1 rounded hover:bg-white/10 transition-colors ${textClasses}/60 hover:${textClasses} disabled:opacity-30 disabled:cursor-not-allowed`}
        />
        <IconButton
          icon={PencilIcon}
          onClick={onEdit}
          disabled={updatePending}
          className={`p-1 rounded hover:bg-white/10 transition-colors ${textClasses}/60 hover:${textClasses}`}
        />
        <IconButton
          icon={TrashIcon}
          onClick={onDelete}
          disabled={deletePending}
          className={`p-1 rounded hover:bg-red-500/20 transition-colors text-red-400 hover:text-red-300`}
        />
        <span className={`text-sm ${textClasses}/80`}>{itemCount}</span>
      </div>
    </div>
  )
}