'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Building2, MapPin, PlusCircle, Home, Users } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import MobileNav from '@/components/MobileNav'
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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-[#1e3a5f] dark:text-gray-100 mb-2">
            Eden Avenue Properties
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Preparing your portfolio...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const userRole = (session?.user as { role?: string })?.role || 'Unknown'
  const canManage = ['ADMIN', 'MANAGER'].includes(userRole)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar isOpen={false} onClose={() => {}} />
      <TopBar onMenuClick={() => {}} />
      <main className="md:ml-64 mt-16 p-4 md:p-8">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Page header */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a5f] via-sky-700 to-emerald-600 p-6 md:p-8 text-white shadow-lg">
            <div className="absolute inset-y-0 right-0 opacity-20">
              <Building2 className="h-full w-40 md:w-56" />
            </div>
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Portfolio Overview
                </div>
                <h1 className="mt-3 text-3xl md:text-4xl font-bold tracking-tight">
                  Properties & Units
                </h1>
                <p className="mt-2 max-w-xl text-sm md:text-base text-sky-100">
                  A high-level view of all managed properties, occupancy and growth. Craft a
                  portfolio experience that feels premium and effortless.
                </p>
              </div>
              {canManage && (
                <div className="flex flex-col items-start gap-3 md:items-end">
                  <div className="rounded-xl bg-black/10 px-4 py-3 text-sm backdrop-blur">
                    <p className="text-sky-50">
                      <span className="font-semibold">
                        {properties.length ? properties.length : 'No'}
                      </span>{' '}
                      active properties
                    </p>
                    <p className="text-xs text-sky-100/80">
                      Click &quot;Add Property&quot; to grow your portfolio.
                    </p>
                  </div>
                  <Button
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center gap-2 bg-white text-[#1e3a5f] hover:bg-sky-50"
                  >
                    <PlusCircle className="h-4 w-4" />
                    {showForm ? 'Cancel' : 'Add Property'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Info banner for restricted roles */}
          {!canManage && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 shadow-sm dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              You are viewing a read‑only overview. Please contact an administrator to manage
              properties.
            </div>
          )}

          {/* Quick stats strip */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-0 bg-white shadow-sm dark:bg-gray-900">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Total Properties
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {properties.length}
                  </p>
                </div>
                <div className="rounded-full bg-sky-100 p-3 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                  <Building2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-sm dark:bg-gray-900">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Total Units
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {properties.reduce((acc, p) => acc + p.units.length, 0)}
                  </p>
                </div>
                <div className="rounded-full bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Home className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-sm dark:bg-gray-900 md:col-span-1">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Portfolio Occupancy
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {(() => {
                      const totalUnits = properties.reduce((acc, p) => acc + p.units.length, 0)
                      if (!totalUnits) return '—'
                      const occupied = properties.reduce(
                        (acc, p) => acc + p.units.filter(u => u.isOccupied).length,
                        0
                      )
                      return `${Math.round((occupied / totalUnits) * 100)}%`
                    })()}
                  </p>
                </div>
                <div className="rounded-full bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create form */}
          {showForm && canManage && (
            <Card className="border-0 bg-white shadow-md dark:bg-gray-900">
              <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                    <PlusCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Add New Property</CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Capture the essentials; units and residents can be linked afterwards.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Property Name</Label>
                    <Input
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Eden Avenue Residences"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-1">
                    <Label>Address</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <Input
                        className="pl-9"
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        placeholder="123 Main St, City, State 12345"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 flex items-center justify-between pt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      You can enrich this property later with units, residents and notes.
                    </p>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Creating...' : 'Create Property'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Property list */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Property portfolio
              </h2>
              {properties.length > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Click a card for rich unit‑level insights.
                </p>
              )}
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {properties.length === 0 ? (
                <div className="col-span-full rounded-xl border border-dashed border-gray-300 bg-white/60 p-10 text-center text-sm text-gray-500 shadow-sm dark:border-gray-700 dark:bg-gray-900/40 dark:text-gray-400">
                  <p className="font-medium">No properties yet</p>
                  <p className="mt-1 text-xs">
                    Use the &quot;Add Property&quot; action above to create your first asset.
                  </p>
                </div>
              ) : (
                properties.map(property => {
                  const totalUnits = property.units.length
                  const occupiedUnits = property.units.filter(u => u.isOccupied).length
                  const occupancyRate =
                    totalUnits === 0 ? 0 : Math.round((occupiedUnits / totalUnits) * 100)

                  return (
                    <Card
                      key={property.id}
                      className="group flex cursor-pointer flex-col overflow-hidden border-0 bg-white shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:shadow-md hover:ring-sky-200 dark:bg-gray-900 dark:ring-gray-800 dark:hover:ring-sky-600/40"
                      onClick={() => router.push(`/properties/${property.id}`)}
                    >
                      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                              <Building2 className="h-4 w-4" />
                            </span>
                            <span className="line-clamp-1">{property.name}</span>
                          </CardTitle>
                          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <MapPin className="h-3 w-3" />
                            <span className="line-clamp-1">{property.address}</span>
                          </p>
                        </div>
                        <span
                          className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          aria-label="Occupancy rate"
                        >
                          {totalUnits === 0 ? 'No Units' : `${occupancyRate}% Occupied`}
                        </span>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-0">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/80">
                            <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Total Units
                            </p>
                            <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
                              {totalUnits}
                            </p>
                          </div>
                          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/80">
                            <p className="text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Occupied
                            </p>
                            <p className="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-300">
                              {occupiedUnits}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
                            <span>Occupancy</span>
                            <span>{totalUnits === 0 ? '—' : `${occupancyRate}%`}</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                            <div
                              className={`h-full rounded-full ${
                                occupancyRate > 89
                                  ? 'bg-emerald-500'
                                  : occupancyRate > 60
                                  ? 'bg-sky-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{
                                width: totalUnits === 0 ? '0%' : `${occupancyRate}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[11px] text-gray-500 dark:text-gray-400">
                          <span>
                            Created:{' '}
                            {new Date(property.createdAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="inline-flex items-center gap-1 text-sky-600 group-hover:text-sky-700 dark:text-sky-400">
                            View details
                            <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                              →
                            </span>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </section>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
