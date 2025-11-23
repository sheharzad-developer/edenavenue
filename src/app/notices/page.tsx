'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import MobileNav from '@/components/MobileNav'

interface Notice {
  id: string
  title: string
  content: string
  type: 'GENERAL' | 'MAINTENANCE' | 'EMERGENCY' | 'EVENT' | 'BILLING'
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  isPublished: boolean
  expiresAt: string | null
  createdAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
}

export default function NoticesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notices, setNotices] = useState<Notice[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'GENERAL',
    priority: 'NORMAL',
    isPublished: false,
    expiresAt: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<string>('')

  const userRole = (session?.user as { role?: string })?.role
  const canManage = ['ADMIN', 'MANAGER'].includes(userRole || '')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, filter])

  async function fetchNotices() {
    setLoading(true)
    try {
      const url = filter ? `/api/notices?type=${filter}` : '/api/notices'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch notices')
      const data = await res.json()
      setNotices(data.notices || [])
    } catch (err) {
      console.error('Error fetching notices:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchNotices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, filter])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = selectedNotice ? `/api/notices/${selectedNotice.id}` : '/api/notices'
      const method = selectedNotice ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to save notice')
        return
      }

      setFormData({
        title: '',
        content: '',
        type: 'GENERAL',
        priority: 'NORMAL',
        isPublished: false,
        expiresAt: '',
      })
      setShowForm(false)
      setSelectedNotice(null)
      fetchNotices()
    } catch (err) {
      console.error('Error saving notice:', err)
      alert('Failed to save notice')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this notice?')) return

    try {
      const res = await fetch(`/api/notices/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchNotices()
    } catch (err) {
      console.error('Error deleting notice:', err)
      alert('Failed to delete notice')
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case 'EMERGENCY':
        return 'bg-red-600 text-white'
      case 'MAINTENANCE':
        return 'bg-orange-500 text-white'
      case 'EVENT':
        return 'bg-purple-500 text-white'
      case 'BILLING':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-600 text-white'
      case 'HIGH':
        return 'bg-orange-500 text-white'
      case 'NORMAL':
        return 'bg-blue-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading notices...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
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
          <h1 className="text-3xl font-bold gradient-text mb-2">Notices & Announcements</h1>
          <p className="text-muted-foreground">View and manage community notices</p>
        </div>
        {canManage && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedNotice(null)}>Create Notice</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold gradient-text">
                  {selectedNotice ? 'Edit Notice' : 'Create Notice'}
                </DialogTitle>
                <DialogClose onClick={() => setSelectedNotice(null)} />
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows={6}
                    disabled={submitting}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type</Label>
                    <Select
                      id="type"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      disabled={submitting}
                    >
                      <option value="GENERAL">General</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="EMERGENCY">Emergency</option>
                      <option value="EVENT">Event</option>
                      <option value="BILLING">Billing</option>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      id="priority"
                      value={formData.priority}
                      onChange={e => setFormData({ ...formData, priority: e.target.value })}
                      disabled={submitting}
                    >
                      <option value="LOW">Low</option>
                      <option value="NORMAL">Normal</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={formData.expiresAt}
                    onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                {canManage && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isPublished"
                      checked={formData.isPublished}
                      onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                      disabled={submitting}
                      className="rounded"
                    />
                    <Label htmlFor="isPublished">Publish immediately</Label>
                  </div>
                )}
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setSelectedNotice(null)
                      setFormData({
                        title: '',
                        content: '',
                        type: 'GENERAL',
                        priority: 'NORMAL',
                        isPublished: false,
                        expiresAt: '',
                      })
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="gradient-primary">
                    {submitting ? 'Saving...' : selectedNotice ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {canManage && (
        <div className="mb-4">
          <Select value={filter} onChange={e => setFilter(e.target.value)} className="w-48">
            <option value="">All Types</option>
            <option value="GENERAL">General</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="EMERGENCY">Emergency</option>
            <option value="EVENT">Event</option>
            <option value="BILLING">Billing</option>
          </Select>
        </div>
      )}

      {notices.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No notices found
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notices.map(notice => (
            <Card key={notice.id} className="hover-lift">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{notice.title}</CardTitle>
                      <Badge className={getTypeColor(notice.type)}>{notice.type}</Badge>
                      <Badge className={getPriorityColor(notice.priority)}>{notice.priority}</Badge>
                      {!notice.isPublished && canManage && <Badge variant="outline">Draft</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      By {notice.author.name || notice.author.email} •{' '}
                      {new Date(notice.createdAt).toLocaleDateString()}
                      {notice.expiresAt &&
                        ` • Expires: ${new Date(notice.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedNotice(notice)
                          setFormData({
                            title: notice.title,
                            content: notice.content,
                            type: notice.type,
                            priority: notice.priority,
                            isPublished: notice.isPublished,
                            expiresAt: notice.expiresAt
                              ? new Date(notice.expiresAt).toISOString().slice(0, 16)
                              : '',
                          })
                          setShowForm(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(notice.id)}>
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-foreground">{notice.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <MobileNav />
    </div>
  )
}
