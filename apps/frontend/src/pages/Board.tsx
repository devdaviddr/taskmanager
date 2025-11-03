import { useParams } from 'react-router-dom'
import PageLayout from '../components/PageLayout'
import PageHeader from '../components/PageHeader'

export default function Board() {
  const { id } = useParams<{ id: string }>()

  return (
    <PageLayout>
      <PageHeader title={`Board ${id}`} description="Manage your board tasks and projects." />
      <div className="mt-6">
        <p className="text-gray-600">Board page content for board ID: {id}</p>
      </div>
    </PageLayout>
  )
}