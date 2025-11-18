'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface RequestStats {
  open: number
  inProgress: number
  resolved: number
  closed: number
  total: number
  recentRequests: number
  unassigned: number
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<RequestStats | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/requests/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    const userRole = (session?.user as { role?: string })?.role
    if (status === 'authenticated' && ['ADMIN', 'MANAGER'].includes(userRole || '')) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchStats()
    }
  }, [status, session, fetchStats])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <h2 className="text-4xl font-bold gradient-text mb-2">Eden Avenue Management</h2>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will redirect via useEffect
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  const userRole = (session?.user as { role?: string })?.role || 'Unknown'
  const userName = session?.user?.name || session?.user?.email || 'User'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Dashboard</h1>
            <p className="text-muted-foreground text-lg">Welcome back, {userName}!</p>
          </div>
          <Button variant="outline" onClick={handleSignOut} className="hover-lift">
            Sign out
          </Button>
        </div>

        {['ADMIN', 'MANAGER'].includes(userRole) && stats && (
          <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="hover-lift border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary text-sm">Open Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-500">{stats.open}</p>
                {stats.unassigned > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {stats.unassigned} unassigned
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="hover-lift border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary text-sm">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-yellow-500">{stats.inProgress}</p>
              </CardContent>
            </Card>

            <Card className="hover-lift border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary text-sm">Resolved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-500">{stats.resolved}</p>
              </CardContent>
            </Card>

            <Card className="hover-lift border-border/50 shadow-lg">
              <CardHeader>
                <CardTitle className="text-primary text-sm">New (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold gradient-text">{stats.recentRequests}</p>
                <p className="text-xs text-muted-foreground mt-1">Recent complaints</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover-lift border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary">Your Role</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold gradient-text">{userRole}</p>
            </CardContent>
          </Card>

          <Card className="hover-lift border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full hover-lift"
                  onClick={() => router.push('/dashboard/requests')}
                >
                  View Maintenance Requests
                </Button>
                {stats && stats.open > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white px-2 py-0.5 text-xs font-bold">
                    {stats.open}
                  </Badge>
                )}
              </div>
              {['ADMIN', 'MANAGER'].includes(userRole) && (
                <Button
                  variant="outline"
                  className="w-full hover-lift"
                  onClick={() => router.push('/properties')}
                >
                  Manage Properties
                </Button>
              )}
              {userRole === 'ADMIN' && (
                <Button
                  variant="outline"
                  className="w-full hover-lift"
                  onClick={() => router.push('/users')}
                >
                  View All Users
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="hover-lift border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-primary">Account Info</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Email: {session?.user?.email}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
