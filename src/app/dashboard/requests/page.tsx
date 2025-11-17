'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import RequestForm from '@/components/RequestForm'
import RequestList from '@/components/RequestList'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function DashboardRequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  const handleSubmit = async (data: { title: string; description: string; priority: string }) => {
    const res = await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(error.error || 'Failed to create request')
    }

    setShowForm(false)
    setRefreshKey(prev => prev + 1) // Trigger refresh
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect via useEffect
  }

  const userRole = (session?.user as { role?: string })?.role

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Maintenance Requests
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            View and manage maintenance requests
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'New Request'}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardContent className="pt-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-gray-100">
              Create New Request
            </h2>
            <RequestForm onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <RequestList key={refreshKey} userRole={userRole} />
    </div>
  )
}
