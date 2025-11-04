import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'

    const classes = `${baseClasses} ${error ? 'border-red-300' : 'border-gray-300'} ${className}`

    return (
      <div>
        <input ref={ref} className={classes} {...props} />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input