import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Select'
import ModalHeader from '../composites/ModalHeader'

interface User {
  id: number
  email: string
  name?: string
  role: 'user' | 'admin' | 'superadmin'
  created_at: string
  updated_at: string
}

interface UserDetailsModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: number, data: { role?: 'user' | 'admin' | 'superadmin'; name?: string; email?: string }) => Promise<void>
  currentUser: User | null
}

export default function UserDetailsModal({ user, isOpen, onClose, onSave, currentUser }: UserDetailsModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'user' | 'admin' | 'superadmin'>('user')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setRole(user.role)
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setIsLoading(true)
    try {
      await onSave(user.id, { name, email, role })
      onClose()
    } catch (error) {
      console.error('Failed to update user:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const canEditRole = (targetUser: User) => {
    if (!currentUser) return false
    if (currentUser.role === 'superadmin') return true
    if (currentUser.role === 'admin' && targetUser.role === 'user') return true
    return false
  }

  if (!isOpen || !user) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <ModalHeader title="Edit User Details" onClose={onClose} />
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">User ID</label>
            <div className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm">
              {user.id}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value as 'user' | 'admin' | 'superadmin')}
              disabled={!canEditRole(user)}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              {currentUser?.role === 'superadmin' && (
                <option value="superadmin">Super Admin</option>
              )}
            </Select>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <Button onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
    </div>
  )
}