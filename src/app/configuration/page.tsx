'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Label from '@/components/ui/Label'
import { Building2, Users, Bell, Shield, Database, Settings as SettingsIcon } from 'lucide-react'

export default function ConfigurationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/dashboard')} className="mb-4">
          ← Back to Dashboard
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-[#1e3a5f]" />
          <h1 className="text-3xl font-bold text-gray-800">Configuration</h1>
        </div>
        <p className="text-gray-600">Manage system settings and configurations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {configSections.map(section => {
          const Icon = section.icon
          return (
            <Card
              key={section.id}
              className="hover-lift cursor-pointer border-border/50 shadow-lg"
              onClick={() => router.push(section.path)}
            >
              <CardHeader>
                <div
                  className={`${section.bgColor} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}
                >
                  <Icon className={`${section.color} w-6 h-6`} />
                </div>
                <CardTitle className="text-xl">{section.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{section.description}</p>
                <Button variant="outline" className="w-full">
                  Configure →
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* System Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-semibold">Environment</Label>
              <p className="text-muted-foreground">{process.env.NODE_ENV || 'development'}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold">User Role</Label>
              <p className="text-muted-foreground">{userRole}</p>
            </div>
            <div>
              <Label className="text-sm font-semibold">Current User</Label>
              <p className="text-muted-foreground">
                {session?.user?.name || session?.user?.email || 'Unknown'}
              </p>
            </div>
            <div>
              <Label className="text-sm font-semibold">Application Version</Label>
              <p className="text-muted-foreground">v1.0.0</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
