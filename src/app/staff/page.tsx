'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
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
import Select from '@/components/ui/Select'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/Table'
import Badge from '@/components/ui/Badge'

interface StaffMember {
  id: string
  name: string | null
  email: string
  role: 'ADMIN' | 'MANAGER' | 'MAINTENANCE'
  createdAt: string
}

export default function StaffPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'MAINTENANCE',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const userRole = (session?.user as { role?: string })?.role

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    } else if (status === 'authenticated' && userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      router.push('/dashboard')
    }
  }, [status, router, userRole])

  useEffect(() => {
    if (status === 'authenticated' && ['ADMIN', 'MANAGER'].includes(userRole || '')) {
      fetchStaff()
    }
  }, [status, userRole])

  async function fetchStaff() {
    setLoading(true)
    try {
      const res = await fetch('/api/users/staff')
      if (!res.ok) throw new Error('Failed to fetch staff')
      const data = await res.json()
      setStaff(data.staff || [])
    } catch (err) {
      console.error('Error fetching staff:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      if (selectedStaff) {
        // Update existing staff
        const res = await fetch(`/api/users/staff/${selectedStaff.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            role: formData.role,
            password: formData.password || undefined,
          }),
        })

        if (!res.ok) {
          const error = await res.json()
          alert(error.error || 'Failed to update staff')
          return
        }
      } else {
        // Create new staff via register endpoint
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          }),
        })

        if (!res.ok) {
          const error = await res.json()
          alert(error.error || 'Failed to create staff')
          return
        }
      }

      setFormData({ name: '', email: '', role: 'MAINTENANCE', password: '' })
      setShowForm(false)
      setSelectedStaff(null)
      fetchStaff()
    } catch (err) {
      console.error('Error saving staff:', err)
      alert('Failed to save staff')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this staff member?')) return
    if (id === (session?.user as { id?: string })?.id) {
      alert('Cannot delete your own account')
      return
    }

    try {
      const res = await fetch(`/api/users/staff/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to delete')
        return
      }
      fetchStaff()
    } catch (err) {
      console.error('Error deleting staff:', err)
      alert('Failed to delete staff')
    }
  }

  function getRoleColor(role: string) {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-600 text-white'
      case 'MANAGER':
        return 'bg-purple-600 text-white'
      case 'MAINTENANCE':
        return 'bg-orange-500 text-white'
      default:
        return 'bg-gray-500 text-white'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading staff...</div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !['ADMIN', 'MANAGER'].includes(userRole || '')) {
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
          <h1 className="text-3xl font-bold gradient-text mb-2">Staff Management</h1>
          <p className="text-muted-foreground">
            Manage staff members (Admin, Manager, Maintenance)
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedStaff(null)}>Add Staff Member</Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold gradient-text">
                {selectedStaff ? 'Edit Staff Member' : 'Add Staff Member'}
              </DialogTitle>
              <DialogClose onClick={() => setSelectedStaff(null)} />
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  disabled={submitting}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={submitting || !!selectedStaff}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  id="role"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  required
                  disabled={submitting}
                >
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="MANAGER">Manager</option>
                  {userRole === 'ADMIN' && <option value="ADMIN">Admin</option>}
                </Select>
              </div>
              <div>
                <Label htmlFor="password">
                  {selectedStaff ? 'New Password (leave blank to keep current)' : 'Password'}
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  required={!selectedStaff}
                  disabled={submitting}
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setSelectedStaff(null)
                    setFormData({ name: '', email: '', role: 'MAINTENANCE', password: '' })
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting} className="gradient-primary">
                  {submitting ? 'Saving...' : selectedStaff ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {staff.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No staff members found
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map(member => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name || '-'}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(member.role)}>{member.role}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedStaff(member)
                          setFormData({
                            name: member.name || '',
                            email: member.email,
                            role: member.role,
                            password: '',
                          })
                          setShowForm(true)
                        }}
                      >
                        Edit
                      </Button>
                      {member.id !== (session?.user as { id?: string })?.id && (
                        <Button variant="outline" size="sm" onClick={() => handleDelete(member.id)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
