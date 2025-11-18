'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'

interface User {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  updatedAt: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers()
    }
  }, [status])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch('/api/users')
      if (!res.ok) {
        throw new Error('Failed to fetch users')
      }
      const data = await res.json()
      setUsers(data.users)
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  function getRoleColor(role: string) {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-500 text-white'
      case 'MANAGER':
        return 'bg-blue-500 text-white'
      case 'MAINTENANCE':
        return 'bg-orange-500 text-white'
      case 'RESIDENT':
        return 'bg-green-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <h2 className="text-4xl font-bold gradient-text mb-2">Eden Avenue Management</h2>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Redirect handled by useEffect
  }

  const userRole = (session?.user as { role?: string })?.role

  if (userRole !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
          Access denied. Only administrators can view this page.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="outline" onClick={() => router.push('/dashboard')} className="mb-4">
            ← Back to Dashboard
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-4xl font-bold gradient-text mb-2">User Management</h1>
          <p className="text-muted-foreground text-lg">
            View all registered users and their registration dates
          </p>
        </div>

        <Card className="hover-lift border-border/50 shadow-lg">
          <CardHeader>
            <CardTitle className="text-primary">Registered Users</CardTitle>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-muted-foreground">No users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || 'No name'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge
                            className={`${getRoleColor(user.role)} px-3 py-1.5 text-sm font-semibold`}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                          <br />
                          <span className="text-xs">
                            {new Date(user.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(user.updatedAt).toLocaleDateString()}
                          <br />
                          <span className="text-xs">
                            {new Date(user.updatedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
