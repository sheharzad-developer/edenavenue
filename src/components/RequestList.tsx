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

  useEffect(() => {
    fetch('/api/requests')
      .then(res => res.json())
      .then(data => setRequests(data.requests || []))
  }, [])

  async function handleViewRequest(requestId: string) {
    setLoading(true)
    setIsModalOpen(true)
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
      <div className="overflow-x-auto">
        <table className="table-auto w-full border border-border rounded-lg">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-4 py-3 text-left font-semibold">Title</th>
              <th className="border border-border px-4 py-3 text-left font-semibold">House/Unit</th>
              <th className="border border-border px-4 py-3 text-left font-semibold">Author</th>
              <th className="border border-border px-4 py-3 text-left font-semibold">Status</th>
              <th className="border border-border px-4 py-3 text-left font-semibold">Priority</th>
              <th className="border border-border px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
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
            ))}
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
                {selectedRequest.assignedTo && (
                  <div>
                    <p className="text-sm font-semibold text-muted-foreground mb-1">Assigned To</p>
                    <p className="text-foreground">
                      {selectedRequest.assignedTo?.name ||
                        selectedRequest.assignedTo?.email ||
                        'Unassigned'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Created</p>
                <p className="text-foreground">
                  {new Date(selectedRequest.createdAt).toLocaleString()}
                </p>
              </div>

              {selectedRequest.comments && selectedRequest.comments.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-muted-foreground mb-3">Comments</p>
                  <div className="space-y-3">
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
                        <p className="text-foreground whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
