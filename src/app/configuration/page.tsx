'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Label from '@/components/ui/Label'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import MobileNav from '@/components/MobileNav'
import {
  Building2,
  Users,
  Bell,
  Shield,
  Database,
  Settings as SettingsIcon,
  Sparkles,
} from 'lucide-react'

export default function ConfigurationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const userRole = (session?.user as { role?: string })?.role

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      router.push('/dashboard')
    }
  }, [status, router, userRole])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold text-[#1e3a5f]">Eden Avenue Configuration</h2>
          <p className="text-gray-600">Loading your control center...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !['ADMIN', 'MANAGER'].includes(userRole || '')) {
    return null
  }

  const configSections = [
    {
      id: 'properties',
      title: 'Properties & Units',
      description: 'Manage properties and unit configurations',
      icon: Building2,
      path: '/properties',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'residents',
      title: 'Resident Management',
      description: 'Configure resident settings and assignments',
      icon: Users,
      path: '/residents',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Manage notification preferences and settings',
      icon: Bell,
      path: '/notices',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      id: 'users',
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Shield,
      path: '/users',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'database',
      title: 'Database Settings',
      description: 'View database connection and migration status',
      icon: Database,
      path: '/dashboard',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(prev => !prev)} />
      <main className="md:ml-64 mt-16 p-4 pb-24 md:p-8 md:pb-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          {/* Hero header */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a5f] via-sky-700 to-emerald-600 p-6 md:p-8 text-white shadow-lg">
            <div className="pointer-events-none absolute inset-y-0 right-0 opacity-15 md:opacity-20">
              <SettingsIcon className="h-full w-40 md:w-56" />
            </div>
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 text-xs font-medium backdrop-blur">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  Configuration Control Center
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                  System Configuration
                </h1>
                <p className="mt-2 max-w-xl text-sm md:text-base text-sky-100">
                  Fine‑tune every aspect of Eden Avenue — from properties and residents to security,
                  notifications, and data. Crafted for administrators who want a calm, powerful
                  overview.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <Button
                  variant="outline"
                  onClick={() => router.push('/dashboard')}
                  className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                >
                  Back to Dashboard
                </Button>
                <p className="text-xs text-sky-100/80">
                  Signed in as{' '}
                  <span className="font-semibold">
                    {session?.user?.name || session?.user?.email || 'Unknown'}
                  </span>
                </p>
              </div>
            </div>
          </section>

          {/* Configuration sections */}
          <section>
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Configuration areas</h2>
                <p className="text-xs text-gray-500">
                  Jump into focused panels to manage each dimension of the platform.
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Role:&nbsp;
                <span className="font-semibold text-gray-600">{userRole}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {configSections.map(section => {
                const Icon = section.icon
                return (
                  <Card
                    key={section.id}
                    className="group flex cursor-pointer flex-col overflow-hidden border-0 bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-sky-200"
                    onClick={() => router.push(section.path)}
                  >
                    <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                      <div>
                        <div
                          className={`${section.bgColor} mb-3 flex h-11 w-11 items-center justify-center rounded-lg`}
                        >
                          <Icon className={`${section.color} h-5 w-5`} />
                        </div>
                        <CardTitle className="text-base">{section.title}</CardTitle>
                      </div>
                      <span className="mt-1 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                        Admin
                      </span>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-0">
                      <p className="text-sm text-gray-500">{section.description}</p>
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>Click to open configuration</span>
                        <span className="inline-flex items-center gap-1 text-sky-600 group-hover:text-sky-700">
                          Configure
                          <span
                            aria-hidden="true"
                            className="transition-transform group-hover:translate-x-0.5"
                          >
                            →
                          </span>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* System Information */}
          <section className="grid gap-6 md:grid-cols-[2fr,1.5fr]">
            <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
              <CardHeader>
                <CardTitle className="text-base">System information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Environment
                    </Label>
                    <p className="mt-1 text-sm text-gray-800">
                      {process.env.NODE_ENV || 'development'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      User role
                    </Label>
                    <p className="mt-1 text-sm text-gray-800">{userRole}</p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Current user
                    </Label>
                    <p className="mt-1 text-sm text-gray-800">
                      {session?.user?.name || session?.user?.email || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Application version
                    </Label>
                    <p className="mt-1 text-sm text-gray-800">v1.0.0</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Configuration tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-xs text-slate-200/90">
                  <li>• Keep roles and permissions tightly scoped for security.</li>
                  <li>• Review notification rules whenever you add a new property.</li>
                  <li>• Use database migrations in your deployment pipeline, not manually.</li>
                  <li>• Test changes in a staging environment before applying to production.</li>
                </ul>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
