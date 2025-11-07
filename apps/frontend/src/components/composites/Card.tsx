import { Draggable } from '@hello-pangea/dnd'

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

interface CardProps {
  item: Item
  index: number
  columnTheme: string
  onClick: () => void
}

function getPrioritySymbol(priority?: 'high' | 'medium' | 'low'): string {
  switch (priority) {
    case 'high':
      return '^^^'
    case 'medium':
      return '^^'
    case 'low':
      return '^'
    default:
      return ''
  }
}

function getDueInfo(end_date?: string): { text: string; isOverdue: boolean } | null {
  if (!end_date) return null
  const now = new Date()
  const due = new Date(end_date)
  const diffTime = due.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays > 0) {
    return { text: `${diffDays} days`, isOverdue: false }
  } else if (diffDays === 0) {
    return { text: 'Due today', isOverdue: false }
  } else {
    const overdueDays = Math.abs(diffDays)
    return { text: `${overdueDays} days overdue!`, isOverdue: true }
  }
}

export default function Card({ item, index, columnTheme, onClick }: CardProps) {
  const columnClasses = columnTheme === 'dark' ? 'bg-black/70' : 'bg-white'
  const textClasses = columnTheme === 'dark' ? 'text-white' : 'text-black'
  const dueInfo = getDueInfo(item.end_date)

  return (
    <Draggable key={item.id} draggableId={item.id.toString()} index={index}>
      {(itemProvided, itemSnapshot) => (
        <div
          ref={itemProvided.innerRef}
          {...itemProvided.draggableProps}
          {...itemProvided.dragHandleProps}
          className={`${columnClasses} p-2 rounded-lg border border-gray-200 shadow-sm cursor-move hover:shadow-md transition-all duration-150 ${
            itemSnapshot.isDragging
              ? 'shadow-xl opacity-95 border-blue-400 ring-2 ring-blue-400/50'
              : 'hover:border-gray-300 hover:shadow-md'
          }`}
          onClick={onClick}
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
              {item.priority && (
                <span className="inline-block bg-red-500/20 text-red-700 text-xs px-1.5 py-0.5 rounded font-medium">
                  {getPrioritySymbol(item.priority)}
                </span>
              )}
              {item.effort !== undefined && (
                <span className="inline-block bg-green-500/20 text-green-700 text-xs px-1.5 py-0.5 rounded font-medium">
                  ⚡{item.effort}
                </span>
              )}
              {dueInfo && (
                <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-medium ${
                  dueInfo.isOverdue ? 'bg-red-500/20 text-red-700' : 'bg-orange-500/20 text-orange-700'
                }`}>
                  {dueInfo.text}
                </span>
              )}
              {item.tags && item.tags.map(tag => (
                <span
                  key={tag.id}
                  className="inline-block text-xs px-1.5 py-0.5 rounded font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
            </div>

          </div>
        </div>
      )}
    </Draggable>
  )
}