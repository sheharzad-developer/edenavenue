'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'

interface MaintenanceRequest {
  id: string
  title: string
  description: string
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdAt: string
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
}

interface RequestListProps {
  userRole?: string
}

export default function RequestList({ userRole }: RequestListProps) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (priorityFilter) params.append('priority', priorityFilter)

      const url = `/api/requests${params.toString() ? `?${params.toString()}` : ''}`
      const res = await fetch(url)

      if (!res.ok) {
        throw new Error('Failed to fetch requests')
      }

      const data = await res.json()
      setRequests(data.requests || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, priorityFilter])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-600 font-semibold dark:text-red-400'
      case 'HIGH':
        return 'text-orange-600 font-medium dark:text-orange-400'
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400'
      case 'LOW':
        return 'text-gray-600 dark:text-gray-400'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading requests...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4">
        <div>
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="priority-filter"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Priority
          </label>
          <select
            id="priority-filter"
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="mt-1 block rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="">All</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              {userRole !== 'RESIDENT' && <TableHead>Author</TableHead>}
              {['ADMIN', 'MANAGER'].includes(userRole || '') && <TableHead>Assigned To</TableHead>}
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No requests found
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <div className="font-medium">{request.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {request.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        request.status === 'OPEN'
                          ? 'default'
                          : request.status === 'IN_PROGRESS'
                            ? 'warning'
                            : request.status === 'RESOLVED'
                              ? 'success'
                              : 'secondary'
                      }
                    >
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm ${getPriorityColor(request.priority)}`}>
                      {request.priority}
                    </span>
                  </TableCell>
                  {userRole !== 'RESIDENT' && (
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                      {request.author?.name || request.author?.email || 'N/A'}
                    </TableCell>
                  )}
                  {['ADMIN', 'MANAGER'].includes(userRole || '') && (
                    <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                      {request.assignedTo?.name || request.assignedTo?.email || 'Unassigned'}
                    </TableCell>
                  )}
                  <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/dashboard/requests/${request.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
