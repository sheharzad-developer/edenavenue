'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock3, FileText, PlusCircle } from 'lucide-react'
import RequestList from '@/components/RequestList'
import Button from '@/components/ui/Button'
import NotificationListener from '@/components/NotificationListener'
import MobileNav from '@/components/MobileNav'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import { Card, CardContent } from '@/components/ui/Card'

interface RequestStats {
  open: number
  inProgress: number
  resolved: number
  closed: number
  total: number
  recentRequests: number
  unassigned: number
}

export default function DashboardRequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<RequestStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [statsError, setStatsError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    const userRole = (session?.user as { role?: string })?.role
    if (status === 'authenticated' && ['ADMIN', 'MANAGER'].includes(userRole || '')) {
      ;(async () => {
        try {
          setStatsLoading(true)
          const res = await fetch('/api/requests/stats')
          if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            setStatsError(data.error || 'Failed to load request statistics.')
            return
          }
          const data = (await res.json()) as { stats: RequestStats }
          setStats(data.stats)
          setStatsError(null)
        } catch (error) {
          console.error('Error loading request stats:', error)
          setStatsError('Network error while loading request statistics.')
        } finally {
          setStatsLoading(false)
        }
      })()
    } else {
      setStatsLoading(false)
    }
  }, [session, status])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold text-[#1e3a5f]">Eden Avenue Requests</h2>
          <p className="text-gray-600">Preparing your maintenance command center...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect via useEffect
  }

  const userRole = (session?.user as { role?: string })?.role || 'Unknown'

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationListener />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(prev => !prev)} />
      <main className="md:ml-64 mt-16 p-4 pb-24 md:p-8 md:pb-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          {/* Hero header */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a5f] via-sky-700 to-emerald-600 p-6 md:p-8 text-white shadow-lg">
            <div className="pointer-events-none absolute inset-y-0 right-0 opacity-15 md:opacity-20">
              <FileText className="h-full w-40 md:w-56" />
            </div>
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 text-xs font-medium backdrop-blur">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live maintenance cockpit
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                  Maintenance Requests
                </h1>
                <p className="mt-2 max-w-xl text-sm md:text-base text-sky-100">
                  Prioritize, assign, and close requests in a single, elegant workspace. Designed to
                  keep your property operations calm, clear, and in control.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <Button
                  onClick={() => router.push('/dashboard/requests/create')}
                  className="inline-flex items-center gap-2 bg-white text-[#1e3a5f] hover:bg-sky-50"
                >
                  <PlusCircle className="h-4 w-4" />
                  New Request
                </Button>
                <p className="text-xs text-sky-100/80">
                  Role:&nbsp;
                  <span className="font-semibold">
                    {userRole === 'ADMIN' ? 'Administrator' : userRole}
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Stats strip */}
          {['ADMIN', 'MANAGER'].includes(userRole) && (
            <section className="grid gap-4 md:grid-cols-4">
              <Card className="border-0 bg-white shadow-sm">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Open
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {stats?.open ?? (statsLoading ? '—' : 0)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Awaiting triage</p>
                  </div>
                  <div className="rounded-full bg-sky-100 p-3 text-sky-700">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-white shadow-sm">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      In Progress
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {stats?.inProgress ?? (statsLoading ? '—' : 0)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Actively being resolved</p>
                  </div>
                  <div className="rounded-full bg-amber-100 p-3 text-amber-700">
                    <Clock3 className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-white shadow-sm">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Resolved (Total)
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {stats?.resolved ?? (statsLoading ? '—' : 0)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Closed with a solution</p>
                  </div>
                  <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 bg-white shadow-sm">
                <CardContent className="flex flex-col justify-between gap-2 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Today / Unassigned
                    </p>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                      Live
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">
                    <span className="text-xl font-bold text-[#1e3a5f]">
                      {stats?.recentRequests ?? (statsLoading ? '—' : 0)}
                    </span>{' '}
                    new today
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold text-amber-600">
                      {stats?.unassigned ?? (statsLoading ? '—' : 0)}
                    </span>{' '}
                    waiting for an assignee
                  </p>
                </CardContent>
              </Card>
            </section>
          )}

          {statsError && ['ADMIN', 'MANAGER'].includes(userRole) && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 shadow-sm">
              {statsError}
            </div>
          )}

          {/* Requests table */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Requests pipeline</h2>
                <p className="text-xs text-gray-500">
                  Filter, search, and deep‑dive into every maintenance interaction.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="self-start text-xs md:self-auto"
              >
                Back to Dashboard
              </Button>
            </div>
            <RequestList onRefresh={() => {}} />
          </section>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
