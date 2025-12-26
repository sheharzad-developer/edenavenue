'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import MobileNav from '@/components/MobileNav'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Home, FileText, Bell, Sparkles, Clock } from 'lucide-react'

interface RequestItem {
  id: string
  title: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  author?: {
    id: string
    name: string | null
    email: string
  }
}

interface NoticeItem {
  id: string
  title: string
  type: string
  priority: string
  isPublished: boolean
  createdAt: string
  author: {
    id: string
    name: string | null
    email: string
  }
}

type TimelineItem =
  | {
      kind: 'REQUEST'
      id: string
      date: string
      title: string
      subtitle: string
      status: string
      priority: string
    }
  | {
      kind: 'NOTICE'
      id: string
      date: string
      title: string
      subtitle: string
      type: string
      priority: string
    }

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [loading, setLoading] = useState(true)

  const userId = (session?.user as { id?: string })?.id
  const userName = session?.user?.name || session?.user?.email || 'User'
  const userRole = (session?.user as { role?: string })?.role || 'RESIDENT'

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated' || !userId) return

    const load = async () => {
      try {
        const [reqRes, noticeRes] = await Promise.all([
          fetch('/api/requests', { credentials: 'include' }),
          fetch('/api/notices', { credentials: 'include' }),
        ])

        if (reqRes.ok) {
          const data = await reqRes.json()
          setRequests((data.requests || []) as RequestItem[])
        }

        if (noticeRes.ok) {
          const data = await noticeRes.json()
          setNotices((data.notices || []) as NoticeItem[])
        }
      } catch (error) {
        console.error('Error loading profile activity:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [status, userId])

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold text-[#1e3a5f]">Your Profile</h2>
          <p className="text-gray-600">Building your activity timeline...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const myRequests = requests.filter(r => r.author?.id === userId)
  const myNotices = notices.filter(n => n.author?.id === userId)

  const openRequests = myRequests.filter(r => r.status !== 'RESOLVED' && r.status !== 'CLOSED')
  const resolvedRequests = myRequests.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED')

  const timelineItems: TimelineItem[] = (() => {
    const requestItems: TimelineItem[] = myRequests.map(r => ({
      kind: 'REQUEST',
      id: r.id,
      date: r.createdAt,
      title: r.title,
      subtitle: `Maintenance request • ${r.priority} priority`,
      status: r.status,
      priority: r.priority,
    }))

    const noticeItems: TimelineItem[] = myNotices.map(n => ({
      kind: 'NOTICE',
      id: n.id,
      date: n.createdAt,
      title: n.title,
      subtitle: `Notice • ${n.type} • ${n.isPublished ? 'Published' : 'Draft'}`,
      type: n.type,
      priority: n.priority,
    }))

    return [...requestItems, ...noticeItems].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(prev => !prev)} />
      <main className="md:ml-64 mt-16 p-4 pb-24 md:p-8 md:pb-10">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          {/* Profile header */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a5f] via-sky-700 to-emerald-600 p-6 md:p-8 text-white shadow-lg">
            <div className="pointer-events-none absolute inset-y-0 right-0 opacity-15 md:opacity-20">
              <Home className="h-full w-40 md:w-56" />
            </div>
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-semibold uppercase">
                  {userName.charAt(0)}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-sky-100/80">Profile</p>
                  <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{userName}</h1>
                  <p className="mt-1 text-xs md:text-sm text-sky-100/90">
                    {session?.user?.email} • {userRole}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20 text-xs md:text-sm"
                >
                  Back to Dashboard
                </Button>
                <p className="flex items-center gap-1 text-xs text-sky-100/80">
                  <Clock className="h-3 w-3" />
                  <span>Recent activity timeline</span>
                </p>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="grid gap-4 md:grid-cols-3">
            <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Requests created
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{myRequests.length}</p>
                  <p className="mt-1 text-xs text-gray-500">All time maintenance requests</p>
                </div>
                <div className="rounded-full bg-sky-100 p-3 text-sky-700">
                  <FileText className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Open vs resolved
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {openRequests.length}/{resolvedRequests.length}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Open / resolved requests linked to your account
                  </p>
                </div>
                <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
                  <Sparkles className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Notices published
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{myNotices.length}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    Admin announcements you&apos;ve posted
                  </p>
                </div>
                <div className="rounded-full bg-amber-100 p-3 text-amber-700">
                  <Bell className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Timeline */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Activity timeline</h2>
                <p className="text-xs text-gray-500">
                  Most recent maintenance requests and notices, combined in a single stream.
                </p>
              </div>
            </div>

            {timelineItems.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                No activity yet. Submit a maintenance request or, as an admin, post a notice to see
                your history here.
              </p>
            ) : (
              <ol className="relative ml-3 border-l border-gray-200">
                {timelineItems.map(item => (
                  <li key={`${item.kind}-${item.id}`} className="mb-6 ml-4">
                    <div className="absolute -left-2.5 mt-1.5 h-2.5 w-2.5 rounded-full bg-sky-500" />
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <span className="text-xs text-gray-400">
                          {new Date(item.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{item.subtitle}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                        {item.kind === 'REQUEST' && (
                          <>
                            <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">
                              Request • {item.status}
                            </span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                              Priority • {item.priority}
                            </span>
                          </>
                        )}
                        {item.kind === 'NOTICE' && (
                          <>
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                              Notice • {item.type}
                            </span>
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-700">
                              Priority • {item.priority}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
