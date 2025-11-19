'use client'

import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useNotifications } from '@/hooks/useNotifications'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/Alert'

interface NotificationListenerProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onNewRequest?: (request: any) => void
}

export default function NotificationListener({ onNewRequest }: NotificationListenerProps) {
  const { data: session } = useSession()
  const { showNotification, permission } = useNotifications()
  const lastRequestCountRef = useRef<number>(0)
  const lastRequestIdsRef = useRef<Set<string>>(new Set())
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const userRole = (session?.user as { role?: string })?.role

  useEffect(() => {
    // Only run for admins and managers
    if (!['ADMIN', 'MANAGER'].includes(userRole || '')) {
      return
    }

    // Poll for new requests every 10 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/requests')
        if (!res.ok) return

        const data = await res.json()
        const requests = data.requests || []
        const currentCount = requests.length

        // Check for new requests
        if (lastRequestCountRef.current > 0 && currentCount > lastRequestCountRef.current) {
          // Find new requests
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newRequests = requests.filter((req: any) => !lastRequestIdsRef.current.has(req.id))

          // Show notification for each new request
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          newRequests.forEach((request: any) => {
            const authorName = request.author?.name || request.author?.email || 'Unknown'
            const priority = request.priority || 'MEDIUM'

            showNotification({
              title: 'New Maintenance Request',
              body: `${authorName} submitted: "${request.title}" (${priority} priority)`,
              sound: true,
            })

            // Show toast notification (use setTimeout to avoid setState in effect warning)
            setTimeout(() => {
              setToastMessage(`New request: "${request.title}" from ${authorName}`)
              setShowToast(true)
              setTimeout(() => setShowToast(false), 5000)
            }, 0)

            // Callback if provided
            if (onNewRequest) {
              onNewRequest(request)
            }

            // Refresh request list if available
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (typeof (window as any).refreshRequestList === 'function') {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ;(window as any).refreshRequestList()
            }
          })
        }

        // Update tracking
        lastRequestCountRef.current = currentCount
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requests.forEach((req: any) => {
          lastRequestIdsRef.current.add(req.id)
        })
      } catch (error) {
        console.error('Error checking for new requests:', error)
      }
    }, 10000) // Check every 10 seconds

    // Initial fetch
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const requests: any[] = data.requests || []
        lastRequestCountRef.current = requests.length
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        requests.forEach((req: any) => {
          lastRequestIdsRef.current.add(req.id)
        })
      })

    return () => clearInterval(interval)
  }, [userRole, showNotification, onNewRequest])

  if (!['ADMIN', 'MANAGER'].includes(userRole || '')) {
    return null
  }

  return (
    <>
      {showToast && (
        <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top-5">
          <Alert variant="success" className="shadow-lg border-2 border-green-500">
            <AlertTitle className="text-green-900 dark:text-green-100 font-bold">
              🔔 New Request!
            </AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              {toastMessage}
            </AlertDescription>
          </Alert>
        </div>
      )}
      {permission === 'default' && (
        <div className="fixed bottom-4 right-4 z-50 max-w-md">
          <Alert variant="warning">
            <AlertTitle>Enable Notifications</AlertTitle>
            <AlertDescription>
              Click allow to receive notifications when residents submit maintenance requests.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </>
  )
}
