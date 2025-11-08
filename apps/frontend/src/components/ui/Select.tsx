import { forwardRef } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  children: React.ReactNode
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', error, children, ...props }, ref) => {
    const baseClasses = 'w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none cursor-pointer transition-all duration-200'

    const classes = `${baseClasses} ${error ? 'border-red-300' : 'border-gray-300'} ${className}`

    return (
      <div className="relative">
        <select ref={ref} className={classes} {...props}>
          {children}
        </select>
        <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select