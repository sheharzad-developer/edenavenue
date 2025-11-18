'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

export default function Home() {
  const router = useRouter()
  const { status } = useSession()
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (hasRedirected.current) return

    // Add timeout to prevent infinite loading
    const timer = setTimeout(() => {
      if (!hasRedirected.current) {
        hasRedirected.current = true
        router.push('/auth/login')
      }
    }, 2000)

    if (status === 'authenticated') {
      clearTimeout(timer)
      hasRedirected.current = true
      router.push('/dashboard')
    } else if (status === 'unauthenticated') {
      clearTimeout(timer)
      hasRedirected.current = true
      router.push('/auth/login')
    }

    return () => clearTimeout(timer)
  }, [status, router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Eden Avenue Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  )
}
