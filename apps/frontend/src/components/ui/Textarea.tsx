import { forwardRef } from 'react'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none'

    const classes = `${baseClasses} ${error ? 'border-red-300' : 'border-gray-300'} ${className}`

    return (
      <div>
        <textarea ref={ref} className={classes} {...props} />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea