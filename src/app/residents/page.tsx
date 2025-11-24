'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
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
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import MobileNav from '@/components/MobileNav'
import { Users, Home, Building2, Sparkles } from 'lucide-react'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold text-[#1e3a5f]">Eden Avenue Residents</h2>
          <p className="text-gray-600">Loading your resident directory...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated' || !['ADMIN', 'MANAGER'].includes(userRole || '')) {
    return null
  }

  const totalResidents = residents.length
  const assignedResidents = residents.filter(r => r.unit !== null).length
  const uniqueProperties = new Set(residents.map(r => r.unit?.property?.id).filter(Boolean)).size

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(prev => !prev)} />
      <main className="md:ml-64 mt-16 p-4 pb-24 md:p-8 md:pb-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          {/* Hero header */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a5f] via-sky-700 to-emerald-600 p-6 md:p-8 text-white shadow-lg">
            <div className="pointer-events-none absolute inset-y-0 right-0 opacity-15 md:opacity-20">
              <Users className="h-full w-40 md:w-56" />
            </div>
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 text-xs font-medium backdrop-blur">
                  <Sparkles className="h-3 w-3 text-amber-300" />
                  Resident Experience Hub
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                  Resident Management
                </h1>
                <p className="mt-2 max-w-xl text-sm md:text-base text-sky-100">
                  A clear, elegant overview of every resident across your portfolio. Assign units,
                  keep contact details current, and maintain a single source of truth.
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={generateDummyData}
                    disabled={generatingDummy}
                    className="border-white/40 bg-white/10 text-white hover:bg-white/20"
                  >
                    {generatingDummy ? 'Generating...' : 'Generate Dummy Data'}
                  </Button>
                  <Dialog open={showForm} onOpenChange={setShowForm}>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setSelectedResident(null)
                          setFormData({ userId: '', unitId: '', phone: '', moveIn: '' })
                        }}
                        className="inline-flex items-center gap-2 bg-white text-[#1e3a5f] hover:bg-sky-50"
                      >
                        Add Resident
                      </Button>
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
                              .filter(
                                unit => !unit.id || !residents.find(r => r.unit?.id === unit.id)
                              )
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
                        <div className="flex justify-end gap-3 pt-2">
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
                <p className="text-xs text-sky-100/80">
                  Role:&nbsp;<span className="font-semibold">{userRole}</span>
                </p>
              </div>
            </div>
          </section>

          {/* Quick stats */}
          <section className="grid gap-4 md:grid-cols-3">
            <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Total residents
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{totalResidents}</p>
                  <p className="mt-1 text-xs text-gray-500">Active profiles in the system</p>
                </div>
                <div className="rounded-full bg-sky-100 p-3 text-sky-700">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Assigned to units
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{assignedResidents}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {totalResidents
                      ? `${Math.round((assignedResidents / totalResidents) * 100)}% assigned`
                      : '—'}
                  </p>
                </div>
                <div className="rounded-full bg-emerald-100 p-3 text-emerald-700">
                  <Home className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Properties represented
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{uniqueProperties}</p>
                  <p className="mt-1 text-xs text-gray-500">Where at least one resident lives</p>
                </div>
                <div className="rounded-full bg-indigo-100 p-3 text-indigo-700">
                  <Building2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Residents table / empty state */}
          {residents.length === 0 ? (
            <Card className="border-0 bg-white shadow-sm ring-1 ring-gray-100">
              <CardContent className="py-12 text-center">
                <div className="mx-auto max-w-md">
                  <div className="mb-4">
                    <Users className="mx-auto h-12 w-12 text-gray-300" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">No residents found</h3>
                  <p className="mb-6 text-sm text-gray-500">
                    Get started by adding residents or generate sample data to explore the
                    directory.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      onClick={generateDummyData}
                      disabled={generatingDummy}
                    >
                      {generatingDummy ? 'Generating...' : 'Generate Dummy Data'}
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedResident(null)
                        setFormData({ userId: '', unitId: '', phone: '', moveIn: '' })
                        setShowForm(true)
                      }}
                    >
                      Add First Resident
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
              <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Resident directory</h2>
                  <p className="text-xs text-gray-500">
                    Searchable, relational view of residents and their unit assignments.
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
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(resident.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </section>
          )}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
