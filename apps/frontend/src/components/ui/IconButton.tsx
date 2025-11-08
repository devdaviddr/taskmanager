import { forwardRef } from 'react'
import Button from './Button'

interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: React.ComponentType<{ className?: string }>
  size?: 'sm' | 'md' | 'lg'
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, size = 'md', className = '', ...props }, ref) => {
    const iconSizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    }

    return (
      <Button
        ref={ref}
        variant="icon"
        size={size}
        className={className}
        {...props}
      >
        <Icon className={iconSizeClasses[size]} />
      </Button>
    )
  }
)

IconButton.displayName = 'IconButton'

export default IconButton