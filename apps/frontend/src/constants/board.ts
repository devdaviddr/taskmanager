export const BACKGROUND_OPTIONS = [
  { value: 'bg-gray-50', label: 'Light Gray' },
  { value: 'bg-blue-600', label: 'Blue' },
  { value: 'bg-green-600', label: 'Green' },
  { value: 'bg-purple-600', label: 'Purple' },
  { value: 'bg-red-600', label: 'Red' }
]

export const THEME_OPTIONS = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' }
]

export const validateEffort = (effort: string): number | undefined => {
  const parsed = parseInt(effort)
  if (isNaN(parsed) || parsed < 1 || parsed > 10) return undefined
  return parsed
}

export const validateDate = (date: string): boolean => {
  return !date || !isNaN(new Date(date).getTime())
}