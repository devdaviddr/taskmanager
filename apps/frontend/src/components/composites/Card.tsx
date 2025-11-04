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
  archived: boolean
  created_at: string
  updated_at: string
}

interface CardProps {
  item: Item
  index: number
  columnTheme: string
  onClick: () => void
}

export default function Card({ item, index, columnTheme, onClick }: CardProps) {
  const columnClasses = columnTheme === 'dark' ? 'bg-black/70' : 'bg-white'
  const textClasses = columnTheme === 'dark' ? 'text-white' : 'text-black'

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
  )
}