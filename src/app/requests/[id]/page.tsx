'use client'

import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import RequestDetails from '@/components/RequestDetails'

export default function RequestDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const requestId = params.id as string

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Please sign in</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">You need to be authenticated to view request details.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RequestDetails
        requestId={requestId}
        userRole={session.user?.role}
        userId={session.user?.id}
      />
    </div>
  )
}

