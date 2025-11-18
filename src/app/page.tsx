'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Simple redirect without session check to prevent loops
    router.replace('/auth/login')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold gradient-text mb-4">Eden Avenue Management</h1>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
