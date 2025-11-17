'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import RequestForm from '@/components/RequestForm'
import RequestList from '@/components/RequestList'

export default function RequestsPage() {
  const { data: session } = useSession()
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCancel = () => {
    setShowForm(false)
    setRefreshKey((prev) => prev + 1)
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Please sign in</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            You need to be authenticated to view requests.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Maintenance Requests
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          {showForm ? 'Cancel' : 'New Request'}
        </button>
      </div>

      {showForm && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
            Create New Request
          </h2>
          <RequestForm onCancel={handleCancel} />
        </div>
      )}

      <RequestList key={refreshKey} />
    </div>
  )
}
