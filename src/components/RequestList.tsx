'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/Dialog'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'

export default function RequestList() {
  const { data: session } = useSession()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [requests, setRequests] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [newComment, setNewComment] = useState('')
  const [addingComment, setAddingComment] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [staff, setStaff] = useState<any[]>([])
  const [assigning, setAssigning] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [priorityFilter, setPriorityFilter] = useState<string>('')

  useEffect(() => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => setRequests(data.requests || []))
  }, [])

  useEffect(() => {
    // Fetch staff for assignment dropdown
    const userRole = (session?.user as { role?: string })?.role
    if (['ADMIN', 'MANAGER'].includes(userRole || '')) {
      fetch('/api/users/staff')
        .then(res => res.json())
        .then(data => setStaff(data.staff || []))
        .catch(err => console.error('Error fetching staff:', err))
    }
  }, [session])

  async function handleViewRequest(requestId: string) {
    setLoading(true)
    setIsModalOpen(true)
    setNewComment('')
    try {
      const res = await fetch(`/api/requests/${requestId}`)
      const data = await res.json()
      setSelectedRequest(data.request)
    } catch (error) {
      console.error('Error fetching request:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddComment() {
    if (!selectedRequest || !newComment.trim()) return

    setAddingComment(true)
    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newComment.trim() }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to add comment')
        return
      }

      await res.json()
      // Refresh request to get updated comments
      const requestRes = await fetch(`/api/requests/${selectedRequest.id}`)
      const requestData = await requestRes.json()
      setSelectedRequest(requestData.request)
      setNewComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
      alert('Failed to add comment')
    } finally {
      setAddingComment(false)
    }
  }

  async function handleAssignRequest(assigneeId: string | null) {
    if (!selectedRequest) return

    setAssigning(true)
    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assigneeId }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to assign request')
        return
      }

      const data = await res.json()
      setSelectedRequest(data.updated)

      // Refresh the requests list
      const listRes = await fetch('/api/requests')
      const listData = await listRes.json()
      setRequests(listData.requests || [])
    } catch (error) {
      console.error('Error assigning request:', error)
      alert('Failed to assign request')
    } finally {
      setAssigning(false)
    }
  }

  function handleProgressClick() {
    setShowDatePicker(true)
  }

  async function handleConfirmProgress() {
    if (!selectedRequest || !selectedDate) {
      alert('Please select a date')
      return
    }

    setUpdating(true)
    setShowDatePicker(false)
    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to update status')
        return
      }

      const data = await res.json()
      setSelectedRequest(data.updated)
      setSelectedDate('')

      // Refresh the requests list
      const listRes = await fetch('/api/requests')
      const listData = await listRes.json()
      setRequests(listData.requests || [])
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  async function handleUpdateStatus(newStatus: 'RESOLVED') {
    if (!selectedRequest) return

    setUpdating(true)
    try {
      const res = await fetch(`/api/requests/${selectedRequest.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to update status')
        return
      }

      const data = await res.json()
      setSelectedRequest(data.updated)

      // Refresh the requests list
      const listRes = await fetch('/api/requests')
      const listData = await listRes.json()
      setRequests(listData.requests || [])
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  const userRole = (session?.user as { role?: string })?.role
  const canUpdateStatus = ['ADMIN', 'MANAGER', 'MAINTENANCE'].includes(userRole || '')

  // Filter requests based on search and filters
  const filteredRequests = requests.filter(req => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesSearch =
        req.title?.toLowerCase().includes(query) ||
        req.description?.toLowerCase().includes(query) ||
        req.houseNumber?.toLowerCase().includes(query) ||
        req.author?.name?.toLowerCase().includes(query) ||
        req.author?.email?.toLowerCase().includes(query)
      if (!matchesSearch) return false
    }

    // Status filter
    if (statusFilter && req.status !== statusFilter) return false

    // Priority filter
    if (priorityFilter && req.priority !== priorityFilter) return false

    return true
  })

  function getStatusColor(status: string) {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-500 text-white'
      case 'IN_PROGRESS':
        return 'bg-yellow-500 text-white'
      case 'RESOLVED':
        return 'bg-green-500 text-white'
      case 'CLOSED':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-500 text-white'
      case 'HIGH':
        return 'bg-orange-500 text-white'
      case 'MEDIUM':
        return 'bg-yellow-500 text-white'
      case 'LOW':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  return (
    <>
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by title, description, house number, or author..."
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setStatusFilter(e.target.value)
              }
              className="w-40"
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </Select>
            <Select
              value={priorityFilter}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setPriorityFilter(e.target.value)
              }
              className="w-40"
            >
              <option value="">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Select>
            {(searchQuery || statusFilter || priorityFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('')
                  setPriorityFilter('')
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
        {(searchQuery || statusFilter || priorityFilter) && (
          <p className="text-sm text-muted-foreground">
            Showing {filteredRequests.length} of {requests.length} requests
          </p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border border-border rounded-lg">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-4 py-3 text-left font-semibold">Title</th>
              <th className="border border-border px-4 py-3 text-left font-semibold">House/Unit</th>
              <th className="border border-border px-4 py-3 text-left font-semibold">Author</th>
              <th className="border border-border px-4 py-3 text-left font-semibold">Status</th>
              <th className="border border-border px-4 py-3 text-left font-semibold">Priority</th>
              <th className="border border-border px-4 py-3 text-left font-semibold">Created</th>
              <th className="border border-border px-4 py-3 text-left font-semibold">Updated</th>
              <th className="border border-border px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="border border-border px-4 py-8 text-center text-muted-foreground"
                >
                  {requests.length === 0
                    ? 'No requests found'
                    : 'No requests match your search criteria'}
                </td>
              </tr>
            ) : (
              filteredRequests.map(req => (
                <tr
                  key={req.id}
                  className="border-t border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="border border-border px-4 py-3">{req.title}</td>
                  <td className="border border-border px-4 py-3">{req.houseNumber || '-'}</td>
                  <td className="border border-border px-4 py-3">
                    {req.author?.name || req.author?.email}
                  </td>
                  <td className="border border-border px-4 py-3">
                    <Badge
                      className={`${getStatusColor(req.status)} px-3 py-1.5 text-sm font-semibold`}
                    >
                      {req.status}
                    </Badge>
                  </td>
                  <td className="border border-border px-4 py-3">
                    <Badge
                      className={`${getPriorityColor(req.priority)} px-3 py-1.5 text-sm font-semibold`}
                    >
                      {req.priority}
                    </Badge>
                  </td>
                  <td className="border border-border px-4 py-3 text-sm text-muted-foreground">
                    {new Date(req.createdAt).toLocaleDateString()}
                    <br />
                    <span className="text-xs">
                      {new Date(req.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="border border-border px-4 py-3 text-sm text-muted-foreground">
                    {new Date(req.updatedAt).toLocaleDateString()}
                    <br />
                    <span className="text-xs">
                      {new Date(req.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>
                  <td className="border border-border px-4 py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRequest(req.id)}
                      className="hover-lift"
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold gradient-text pr-8">
              {loading ? 'Loading...' : selectedRequest?.title || 'Request Details'}
            </DialogTitle>
            <DialogClose onClick={() => setIsModalOpen(false)} />
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading request details...</p>
            </div>
          ) : selectedRequest ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Status</p>
                  <Badge
                    className={`${getStatusColor(selectedRequest.status)} px-3 py-1.5 text-sm font-semibold`}
                  >
                    {selectedRequest.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Priority</p>
                  <Badge
                    className={`${getPriorityColor(selectedRequest.priority)} px-3 py-1.5 text-sm font-semibold`}
                  >
                    {selectedRequest.priority}
                  </Badge>
                </div>
              </div>

              {canUpdateStatus &&
                selectedRequest.status !== 'RESOLVED' &&
                selectedRequest.status !== 'CLOSED' && (
                  <div className="flex gap-3 pt-2">
                    {selectedRequest.status === 'OPEN' && (
                      <Button
                        onClick={handleProgressClick}
                        disabled={updating}
                        className="gradient-primary hover:opacity-90 transition-opacity"
                      >
                        Progress
                      </Button>
                    )}
                    <Button
                      onClick={() => handleUpdateStatus('RESOLVED')}
                      disabled={updating}
                      className="bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      {updating ? 'Updating...' : 'Done'}
                    </Button>
                  </div>
                )}

              {selectedRequest.houseNumber && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">House/Unit</p>
                  <p className="text-foreground">{selectedRequest.houseNumber}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Description</p>
                <p className="text-foreground whitespace-pre-wrap">{selectedRequest.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Author</p>
                  <p className="text-foreground">
                    {selectedRequest.author?.name || selectedRequest.author?.email || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-1">Assigned To</p>
                  {canUpdateStatus ? (
                    <Select
                      value={selectedRequest.assignedTo?.id || ''}
                      onChange={e => handleAssignRequest(e.target.value || null)}
                      disabled={assigning}
                      className="w-full"
                    >
                      <option value="">Unassigned</option>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {staff.map((member: any) => (
                        <option key={member.id} value={member.id}>
                          {member.name || member.email} ({member.role})
                        </option>
                      ))}
                    </Select>
                  ) : (
                    <p className="text-foreground">
                      {selectedRequest.assignedTo?.name ||
                        selectedRequest.assignedTo?.email ||
                        'Unassigned'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Created</p>
                <p className="text-foreground">
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-3">Comments</p>

                {selectedRequest.comments && selectedRequest.comments.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {selectedRequest.comments.map((comment: any) => (
                      <div
                        key={comment.id}
                        className="bg-muted/50 rounded-lg p-4 border border-border"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-semibold text-foreground">
                            {comment.author?.name || comment.author?.email || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap">{comment.body}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setNewComment(e.target.value)
                    }
                    rows={3}
                    className="w-full"
                  />
                  <Button
                    onClick={handleAddComment}
                    disabled={addingComment || !newComment.trim()}
                    className="w-full gradient-primary hover:opacity-90 transition-opacity"
                  >
                    {addingComment ? 'Adding...' : 'Add Comment'}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Datepicker Modal */}
      <Dialog open={showDatePicker} onOpenChange={setShowDatePicker}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold gradient-text">Set Progress Date</DialogTitle>
            <DialogClose onClick={() => setShowDatePicker(false)} />
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="progress-date">Expected Completion Date</Label>
              <Input
                id="progress-date"
                type="date"
                value={selectedDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSelectedDate(e.target.value)
                }
                min={new Date().toISOString().split('T')[0]}
                className="w-full"
              />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDatePicker(false)
                  setSelectedDate('')
                }}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmProgress}
                disabled={updating || !selectedDate}
                className="gradient-primary hover:opacity-90 transition-opacity"
              >
                {updating ? 'Updating...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
