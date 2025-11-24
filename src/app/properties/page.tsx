'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Home, MapPin, Users } from 'lucide-react'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'

interface Property {
  id: string
  name: string
  address: string
  units: Unit[]
  createdAt: string
}

interface Unit {
  id: string
  name: string
  sizeSqFt: number | null
  rentAmount: number | null
  isOccupied: boolean
}

export default function PropertiesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', address: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProperties()
    }
  }, [status])

  async function fetchProperties() {
    try {
      const res = await fetch('/api/properties')
      const data = await res.json()
      setProperties(data.properties || [])
    } catch (error) {
      console.error('Error fetching properties:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to create property')
        return
      }

      setFormData({ name: '', address: '' })
      setShowForm(false)
      fetchProperties()
    } catch (error) {
      console.error('Error creating property:', error)
      alert('Failed to create property')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const userRole = (session?.user as { role?: string })?.role || 'Unknown'
  const canManage = ['ADMIN', 'MANAGER'].includes(userRole)

  if (!canManage) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
          You don&apos;t have permission to manage properties.
        </div>
      </div>
    )
  }

  const totalProperties = properties.length
  const totalUnits = properties.reduce((sum, property) => sum + property.units.length, 0)
  const occupiedUnits = properties.reduce(
    (sum, property) => sum + property.units.filter(u => u.isOccupied).length,
    0
  )
  const occupancyRate = totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>

        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Portfolio Overview
            </p>
            <h1 className="mt-2 text-3xl font-bold gradient-text">Properties</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Manage your buildings, units, and occupancy in one beautiful view.
            </p>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="rounded-xl bg-white/80 px-5 py-4 text-sm shadow-sm ring-1 ring-gray-200 backdrop-blur dark:bg-gray-900/80 dark:ring-gray-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Occupancy
              </p>
              <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-50">
                {occupancyRate}%
              </p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500"
                  style={{ width: `${occupancyRate}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {occupiedUnits} of {totalUnits || 0} units occupied across {totalProperties}{' '}
                {totalProperties === 1 ? 'property' : 'properties'}.
              </p>
            </div>

            <Button
              onClick={() => setShowForm(!showForm)}
              className="gradient-primary shadow-glow text-white"
            >
              {showForm ? 'Cancel' : 'Add Property'}
            </Button>
          </div>
        </div>

        {showForm && (
          <Card className="mb-8 gradient-card border border-blue-100/60 shadow-sm dark:border-blue-900/40">
            <CardHeader>
              <CardTitle className="gradient-text text-xl">Add New Property</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit}
                className="grid gap-6 md:grid-cols-2 md:items-end"
              >
                <div className="space-y-2">
                  <Label>Property Name</Label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Eden Avenue Apartments"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g., 123 Main St, City, State 12345"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="md:col-span-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="gradient-primary shadow-glow text-white"
                  >
                    {submitting ? 'Creating...' : 'Create Property'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.length === 0 ? (
            <Card className="col-span-full gradient-card border border-dashed border-blue-200/70 text-center dark:border-blue-900/50">
              <CardContent className="py-12">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-glow dark:bg-blue-900/30 dark:text-blue-300">
                  <Home className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-50">
                  No properties yet
                </h2>
                <p className="mx-auto max-w-md text-sm text-gray-600 dark:text-gray-400">
                  Start by adding your first property to unlock a complete, visual overview of your
                  portfolio.
                </p>
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => setShowForm(true)}
                    className="gradient-primary shadow-glow text-white"
                  >
                    Add First Property
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            properties.map(property => {
              const unitsCount = property.units.length
              const occupied = property.units.filter(u => u.isOccupied).length
              const rate = unitsCount ? Math.round((occupied / unitsCount) * 100) : 0

              return (
                <Card
                  key={property.id}
                  className="gradient-card hover-lift relative overflow-hidden border border-blue-100/60 shadow-sm dark:border-blue-900/40"
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-xl">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-glow">
                            {property.name.charAt(0).toUpperCase()}
                          </span>
                          <span>{property.name}</span>
                        </CardTitle>
                        <p className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="mr-1.5 h-4 w-4 text-blue-500" />
                          <span className="truncate">{property.address}</span>
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-500 dark:text-gray-400">
                        <p className="font-medium">Created</p>
                        <p>
                          {property.createdAt
                            ? new Date(property.createdAt).toLocaleDateString()
                            : '-'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="flex items-center text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          <Home className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
                          Units
                        </p>
                        <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-50">
                          {unitsCount}
                        </p>
                      </div>
                      <div>
                        <p className="flex items-center text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          <Users className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                          Occupied
                        </p>
                        <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-50">
                          {occupied}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          Availability
                        </p>
                        <p className="mt-1 text-base font-semibold text-gray-900 dark:text-gray-50">
                          {rate}%
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="mb-1 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Occupancy</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {occupied}/{unitsCount || 0} units
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-500"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        className="w-full border-blue-100 bg-white/80 text-blue-700 hover:bg-blue-50 dark:border-blue-900/60 dark:bg-gray-950/60 dark:text-blue-300"
                        onClick={() => router.push(`/properties/${property.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
