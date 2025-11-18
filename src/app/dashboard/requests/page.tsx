'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import RequestList from '@/components/RequestList'
import Button from '@/components/ui/Button'

export default function DashboardRequestsPage() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="mb-4">
          ← Back to Dashboard
        </Button>
      </div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Maintenance Requests
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            View and manage maintenance requests
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/requests/create')}>New Request</Button>
      </div>

      <RequestList />
    </div>
  )
}
