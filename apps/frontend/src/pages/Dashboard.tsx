import { useNavigate } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import PageHeader from '../components/PageHeader'

interface Board {
  id: number
  name: string
  description: string
  taskCount: number
}

export default function Dashboard() {
  const navigate = useNavigate()

  // Sample board data - in a real app, this would come from an API
  const boards: Board[] = [
    { id: 1, name: 'Project Alpha', description: 'Main development project', taskCount: 12 },
    { id: 2, name: 'Marketing Campaign', description: 'Q4 marketing initiatives', taskCount: 8 },
    { id: 3, name: 'Design System', description: 'UI/UX design components', taskCount: 15 },
    { id: 4, name: 'Bug Fixes', description: 'Critical bug fixes and patches', taskCount: 6 },
  ]

  const handleBoardClick = (boardId: number) => {
    navigate(`/app/board/${boardId}`)
  }

  return (
    <PageLayout>
      <PageHeader title="Dashboard" description="Welcome to your task management dashboard." />

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Boards</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div
              key={board.id}
              onClick={() => handleBoardClick(board.id)}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{board.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{board.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {board.taskCount} tasks
                  </div>
                </div>
                <div className="ml-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {boards.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No boards</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating your first board.</p>
          </div>
        )}
      </div>
    </PageLayout>
  )
}