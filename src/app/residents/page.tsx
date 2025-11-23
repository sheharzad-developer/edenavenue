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

interface Resident {
  id: string
  phone: string | null
  moveIn: string | null
  moveOut: string | null
  user: {
    id: string
    name: string | null
    email: string
  }
  unit: {
    id: string
    name: string
    property: {
      id: string
      name: string
      address: string
    }
  } | null
}

interface User {
  id: string
  name: string | null
  email: string
  role: string
}

interface Unit {
  id: string
  name: string
  property: {
    id: string
    name: string
  }
}

export default function ResidentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [residents, setResidents] = useState<Resident[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null)
  const [formData, setFormData] = useState({
    userId: '',
    unitId: '',
    phone: '',
    moveIn: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [generatingDummy, setGeneratingDummy] = useState(false)

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
      fetchResidents()
      fetchUsers()
      fetchUnits()
    }
  }, [status, userRole])

  async function fetchResidents() {
    setLoading(true)
    try {
      const res = await fetch('/api/residents', {
        credentials: 'include',
      })

      if (!res.ok) {
        let errorMessage = `HTTP ${res.status}: Failed to fetch residents`
        try {
          const errorData = await res.json()
          errorMessage = errorData.error || errorMessage
        } catch {
          // If response is not JSON, use status text
          errorMessage = `HTTP ${res.status}: ${res.statusText || 'Failed to fetch residents'}`
        }
        console.error('Error fetching residents:', {
          status: res.status,
          statusText: res.statusText,
          error: errorMessage,
        })
        // Show error to user
        alert(`Error: ${errorMessage}`)
        setResidents([])
        return
      }

      const data = await res.json()
      setResidents(data.residents || [])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error'
      console.error('Error fetching residents:', err)
      alert(`Network Error: ${errorMessage}`)
      setResidents([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchUsers() {
    try {
      const res = await fetch('/api/users', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        const residentUsers = (data.users || []).filter((u: User) => u.role === 'RESIDENT')
        setUsers(residentUsers)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    }
  }

  async function fetchUnits() {
    try {
      const res = await fetch('/api/properties', {
        credentials: 'include',
      })
      if (res.ok) {
        const data = await res.json()
        const allUnits: Unit[] = []
        data.properties?.forEach((prop: { units: Unit[] }) => {
          prop.units?.forEach((unit: Unit) => {
            allUnits.push(unit)
          })
        })
        setUnits(allUnits)
      }
    } catch (err) {
      console.error('Error fetching units:', err)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const url = selectedResident ? `/api/residents/${selectedResident.id}` : '/api/residents'
      const method = selectedResident ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          unitId: formData.unitId || null,
          moveIn: formData.moveIn || new Date().toISOString(),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to save resident')
        return
      }

      setFormData({ userId: '', unitId: '', phone: '', moveIn: '' })
      setShowForm(false)
      setSelectedResident(null)
      fetchResidents()
      fetchUnits()
    } catch (err) {
      console.error('Error saving resident:', err)
      alert('Failed to save resident')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to remove this resident?')) return

    try {
      const res = await fetch(`/api/residents/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      fetchResidents()
      fetchUnits()
    } catch (err) {
      console.error('Error deleting resident:', err)
      alert('Failed to delete resident')
    }
  }

  async function generateDummyData() {
    if (!confirm('This will create 8 dummy residents with properties and units. Continue?')) {
      return
    }

    setGeneratingDummy(true)
    try {
      const res = await fetch('/api/residents/generate-dummy', {
        method: 'POST',
        credentials: 'include',
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to generate dummy data')
        return
      }

      const data = await res.json()
      alert(`Successfully generated ${data.created} dummy residents!`)
      fetchResidents()
      fetchUsers()
      fetchUnits()
    } catch (err) {
      console.error('Error generating dummy data:', err)
      alert('Failed to generate dummy data')
    } finally {
      setGeneratingDummy(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading residents...</div>
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
          <h1 className="text-3xl font-bold gradient-text mb-2">Resident Management</h1>
          <p className="text-muted-foreground">Manage residents and their unit assignments</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={generateDummyData} disabled={generatingDummy}>
            {generatingDummy ? 'Generating...' : 'Generate Dummy Data'}
          </Button>
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedResident(null)}>Add Resident</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold gradient-text">
                  {selectedResident ? 'Edit Resident' : 'Add Resident'}
                </DialogTitle>
                <DialogClose onClick={() => setSelectedResident(null)} />
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="userId">User</Label>
                  <Select
                    id="userId"
                    value={formData.userId}
                    onChange={e => setFormData({ ...formData, userId: e.target.value })}
                    required
                    disabled={submitting || !!selectedResident}
                  >
                    <option value="">Select a user</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name || user.email}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="unitId">Unit (Optional)</Label>
                  <Select
                    id="unitId"
                    value={formData.unitId}
                    onChange={e => setFormData({ ...formData, unitId: e.target.value })}
                    disabled={submitting}
                  >
                    <option value="">No unit assigned</option>
                    {units
                      .filter(unit => !unit.id || !residents.find(r => r.unit?.id === unit.id))
                      .map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} - {unit.property?.name || 'Unknown'}
                        </option>
                      ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label htmlFor="moveIn">Move-In Date</Label>
                  <Input
                    id="moveIn"
                    type="date"
                    value={formData.moveIn}
                    onChange={e => setFormData({ ...formData, moveIn: e.target.value })}
                    disabled={submitting}
                  />
                </div>
                <div className="flex gap-3 justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setSelectedResident(null)
                      setFormData({ userId: '', unitId: '', phone: '', moveIn: '' })
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="gradient-primary">
                    {submitting ? 'Saving...' : selectedResident ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {residents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <svg
                  className="mx-auto h-16 w-16 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No residents found</h3>
              <p className="text-muted-foreground mb-6">
                Get started by adding residents or generate sample data to see how it works.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={generateDummyData} disabled={generatingDummy}>
                  {generatingDummy ? 'Generating...' : 'Generate Dummy Data'}
                </Button>
                <Button onClick={() => setShowForm(true)}>Add First Resident</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Move-In</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residents.map(resident => (
                <TableRow key={resident.id}>
                  <TableCell className="font-medium">
                    {resident.user?.name || resident.user?.email || '-'}
                  </TableCell>
                  <TableCell>{resident.user?.email || '-'}</TableCell>
                  <TableCell>{resident.phone || '-'}</TableCell>
                  <TableCell>
                    {resident.unit ? (
                      <Badge>{resident.unit.name}</Badge>
                    ) : (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>{resident.unit?.property?.name || '-'}</TableCell>
                  <TableCell>
                    {resident.moveIn ? new Date(resident.moveIn).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedResident(resident)
                          setFormData({
                            userId: resident.user?.id || '',
                            unitId: resident.unit?.id || '',
                            phone: resident.phone || '',
                            moveIn: resident.moveIn
                              ? new Date(resident.moveIn).toISOString().split('T')[0]
                              : '',
                          })
                          setShowForm(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(resident.id)}>
                        Remove
                      </Button>
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
