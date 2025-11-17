'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Comment {
  id: string
  body: string
  createdAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
}

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdAt: string
  updatedAt: string
  author?: {
    id: string
    name: string | null
    email: string
  }
  assignedTo?: {
    id: string
    name: string | null
    email: string
    role: string
  } | null
  comments: Comment[]
}

interface RequestDetailsProps {
  requestId: string
  userRole?: string
  userId?: string
}

export default function RequestDetails({ requestId, userRole, userId }: RequestDetailsProps) {
  const router = useRouter()
  const [request, setRequest] = useState<MaintenanceRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [comment, setComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

  const fetchRequest = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/requests/${requestId}`)
      
      if (!res.ok) {
        throw new Error('Failed to fetch request')
      }
      
      const data = await res.json()
      setRequest(data.request)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load request')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequest()
  }, [requestId])

  const handleStatusChange = async (newStatus: string) => {
    try {
      setIsUpdating(true)
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        throw new Error('Failed to update request')
      }

      await fetchRequest()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAssign = async (assigneeId: string) => {
    try {
      setIsUpdating(true)
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId }),
      })

      if (!res.ok) {
        throw new Error('Failed to assign request')
      }

      await fetchRequest()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign request')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      setIsSubmittingComment(true)
      // Note: You'll need to create a POST /api/requests/[id]/comments endpoint
      // For now, this is a placeholder
      const res = await fetch(`/api/requests/${requestId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: comment.trim() }),
      })

      if (!res.ok) {
        throw new Error('Failed to add comment')
      }

      setComment('')
      await fetchRequest()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading request details...</div>
      </div>
    )
  }

  if (error && !request) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
        {error}
      </div>
    )
  }

  if (!request) {
    return <div>Request not found</div>
  }

  const canEdit = ['ADMIN', 'MANAGER', 'MAINTENANCE'].includes(userRole || '') ||
    (userRole === 'RESIDENT' && request.author?.id === userId && request.status === 'OPEN')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{request.title}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Created {new Date(request.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
            request.status === 'OPEN' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
            request.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
            request.status === 'RESOLVED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
          }`}>
            {request.status.replace('_', ' ')}
          </span>
          <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
            request.priority === 'URGENT' ? 'text-red-600 dark:text-red-400' :
            request.priority === 'HIGH' ? 'text-orange-600 dark:text-orange-400' :
            request.priority === 'MEDIUM' ? 'text-yellow-600 dark:text-yellow-400' :
            'text-gray-600 dark:text-gray-400'
          }`}>
            {request.priority}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">Description</h2>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{request.description}</p>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Author</h3>
          <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
            {request.author?.name || request.author?.email || 'Unknown'}
          </p>
        </div>
        {request.assignedTo && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</h3>
            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
              {request.assignedTo.name || request.assignedTo.email}
            </p>
          </div>
        )}
      </div>

      {/* Actions (Admin/Manager/Maintenance only) */}
      {canEdit && (
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <h3 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">Actions</h3>
          <div className="flex flex-wrap gap-3">
            {['ADMIN', 'MANAGER', 'MAINTENANCE'].includes(userRole || '') && (
              <>
                <select
                  value={request.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdating}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </>
            )}
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">Comments</h2>
        
        <div className="mb-4 space-y-4">
          {request.comments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>
          ) : (
            request.comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-200 pb-4 last:border-0 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {comment.author.name || comment.author.email}
                    </p>
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {comment.body}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddComment} className="mt-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Add a comment..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            disabled={isSubmittingComment || !comment.trim()}
            className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isSubmittingComment ? 'Adding...' : 'Add Comment'}
          </button>
        </form>
      </div>
    </div>
  )
}

