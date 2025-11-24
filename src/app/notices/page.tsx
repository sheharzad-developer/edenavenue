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
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { BellRing, AlertTriangle, Megaphone, Sparkles } from 'lucide-react'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold text-[#1e3a5f]">Community Notices</h2>
          <p className="text-gray-600">Preparing your announcements board...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const totalNotices = notices.length
  const urgentNotices = notices.filter(
    n => n.priority === 'URGENT' || n.type === 'EMERGENCY'
  ).length
  const activePublished = notices.filter(n => {
    if (!n.isPublished) return false
    if (!n.expiresAt) return true
    return new Date(n.expiresAt) > new Date()
  }).length
  const draftNotices = notices.filter(n => !n.isPublished).length

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(prev => !prev)} />
      <main className="md:ml-64 mt-16 p-4 md:p-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          {/* Hero header */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a5f] via-sky-700 to-emerald-600 p-6 md:p-8 text-white shadow-lg">
            <div className="pointer-events-none absolute inset-y-0 right-0 opacity-15 md:opacity-20">
              <Megaphone className="h-full w-40 md:w-56" />
            </div>
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 text-xs font-medium backdrop-blur">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  Community announcements
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                  Notices &amp; Announcements
                </h1>
                <p className="mt-2 max-w-xl text-sm md:text-base text-sky-100">
                  A single, beautiful board for resident‑wide announcements, emergencies, and
                  updates. Designed to keep everyone aligned without noise.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20 text-xs md:text-sm"
                >
                  Back to Dashboard
                </Button>
                {canManage && (
                  <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
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
                        className="inline-flex items-center gap-2 bg-white text-[#1e3a5f] hover:bg-sky-50"
                      >
                        <BellRing className="h-4 w-4" />
                        Create Notice
                      </Button>
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
                              onChange={e =>
                                setFormData({ ...formData, isPublished: e.target.checked })
                              }
                              disabled={submitting}
                              className="rounded"
                            />
                            <Label htmlFor="isPublished">Publish immediately</Label>
                          </div>
                        )}
                        <div className="flex justify-end gap-3 pt-2">
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
            </div>
          </section>

          {/* Stats and filters */}
          <section className="grid gap-4 md:grid-cols-4">
            <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Total notices
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{totalNotices}</p>
                  <p className="mt-1 text-xs text-gray-500">All time announcements</p>
                </div>
                <div className="rounded-full bg-sky-100 p-3 text-sky-700">
                  <Megaphone className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Active &amp; published
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{activePublished}</p>
                  <p className="mt-1 text-xs text-gray-500">Currently visible to residents</p>
                </div>
                <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
                  <BellRing className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Urgent / emergency
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{urgentNotices}</p>
                  <p className="mt-1 text-xs text-gray-500">Require immediate attention</p>
                </div>
                <div className="rounded-full bg-red-100 p-3 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Drafts
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {canManage ? draftNotices : '—'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    {canManage ? 'Saved but not yet published' : 'Managed by administrators'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Filters and list */}
          <section className="space-y-4">
            {canManage && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  Filter by type to focus on a specific channel of communication.
                </p>
                <Select
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  className="w-48 text-sm"
                >
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
              <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
                <CardContent className="py-10 text-center text-sm text-gray-500">
                  No notices found. {canManage ? 'Create your first announcement above.' : ''}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {notices.map(notice => (
                  <Card
                    key={notice.id}
                    className="group border-0 bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-sky-200"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <CardTitle className="text-base md:text-lg">{notice.title}</CardTitle>
                            <Badge className={getTypeColor(notice.type)}>{notice.type}</Badge>
                            <Badge className={getPriorityColor(notice.priority)}>
                              {notice.priority}
                            </Badge>
                            {!notice.isPublished && canManage && (
                              <Badge variant="outline">Draft</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(notice.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap text-sm text-gray-800">{notice.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
