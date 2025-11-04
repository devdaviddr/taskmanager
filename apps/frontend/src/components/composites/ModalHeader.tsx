import Button from '../ui/Button'

interface ModalHeaderProps {
  title: string
  onClose: () => void
}

export default function ModalHeader({ title, onClose }: ModalHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      <Button variant="ghost" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
        ✕
      </Button>
    </div>
  )
}