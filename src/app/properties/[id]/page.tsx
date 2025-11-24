'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'
import Sidebar from '@/components/Sidebar'
import TopBar from '@/components/TopBar'
import MobileNav from '@/components/MobileNav'
import { Building2, MapPin, Users, Home } from 'lucide-react'

interface Unit {
  id: string
  name: string
  sizeSqFt: number | null
  rentAmount: number | null
  isOccupied: boolean
  resident: {
    user: {
      name: string | null
      email: string
    }
  } | null
}

interface Property {
  id: string
  name: string
  address: string
  units: Unit[]
  createdAt: string
}

export default function PropertyDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const propertyId = params?.id as string

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUnitForm, setShowUnitForm] = useState(false)
  const [unitFormData, setUnitFormData] = useState({
    name: '',
    sizeSqFt: '',
    rentAmount: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated' && propertyId) {
      fetchProperty()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, propertyId])

  async function fetchProperty() {
    try {
      const res = await fetch(`/api/properties/${propertyId}`)
      if (!res.ok) {
        throw new Error('Failed to fetch property')
      }
      const data = await res.json()
      setProperty(data.property)
    } catch (error) {
      console.error('Error fetching property:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddUnit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch(`/api/properties/${propertyId}/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: unitFormData.name,
          sizeSqFt: unitFormData.sizeSqFt ? parseInt(unitFormData.sizeSqFt) : null,
          rentAmount: unitFormData.rentAmount ? parseFloat(unitFormData.rentAmount) : null,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Failed to create unit')
        return
      }

      setUnitFormData({ name: '', sizeSqFt: '', rentAmount: '' })
      setShowUnitForm(false)
      fetchProperty()
    } catch (error) {
      console.error('Error creating unit:', error)
      alert('Failed to create unit')
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center">
          <h2 className="mb-2 text-3xl font-bold text-[#1e3a5f] dark:text-gray-100">
            Property Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Loading property details...</p>
        </div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
          Property not found
        </div>
      </div>
    )
  }

  const userRole = (session?.user as { role?: string })?.role || 'Unknown'
  const canManage = ['ADMIN', 'MANAGER'].includes(userRole)
  const mapQuery = encodeURIComponent(property.address)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(prev => !prev)} />
      <main className="md:ml-64 mt-16 p-4 pb-24 md:p-8 md:pb-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          {/* Hero header */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1e3a5f] via-sky-700 to-emerald-600 p-6 md:p-8 text-white shadow-lg">
            <div className="pointer-events-none absolute inset-y-0 right-0 opacity-15 md:opacity-20">
              <Building2 className="h-full w-40 md:w-56" />
            </div>
            <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-black/15 px-3 py-1 text-xs font-medium backdrop-blur">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Property overview
                </div>
                <h1 className="mt-3 text-2xl font-bold tracking-tight md:text-3xl">
                  {property.name}
                </h1>
                <p className="mt-2 flex items-center gap-1 text-xs md:text-sm text-sky-100">
                  <MapPin className="h-3 w-3" />
                  <span className="line-clamp-1">{property.address}</span>
                </p>
                <p className="mt-2 text-[11px] text-sky-100/80">
                  Created on{' '}
                  {new Date(property.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex flex-col items-start gap-3 md:items-end">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/properties')}
                    className="border-white/40 bg-white/10 text-white hover:bg-white/20 text-xs md:text-sm"
                  >
                    Back to Properties
                  </Button>
                  {canManage && (
                    <Button
                      onClick={() => setShowUnitForm(prev => !prev)}
                      className="inline-flex items-center gap-2 bg-white text-[#1e3a5f] hover:bg-sky-50"
                    >
                      {showUnitForm ? 'Cancel' : 'Add Unit'}
                    </Button>
                  )}
                </div>
                <p className="flex items-center gap-1 text-xs text-sky-100/80">
                  <Home className="h-3 w-3" />
                  <span>Property details &amp; unit history</span>
                </p>
              </div>
            </div>
          </section>

          {/* Location map */}
          <section className="grid gap-4 md:grid-cols-[3fr,2fr]">
            <Card className="border-0 bg-white shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Location map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
                  <iframe
                    title="Property location map"
                    src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                    className="h-64 w-full md:h-80"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Map location is based on the property address. For precise pin placement, ensure
                  the address is accurate.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Stats */}
          <section className="grid gap-4 md:grid-cols-3">
            <Card className="border-0 bg-white shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Total units
                  </p>
                  <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {property.units.length}
                  </p>
                </div>
                <div className="rounded-full bg-sky-100 p-3 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                  <Building2 className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Occupied
                  </p>
                  <p className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-300">
                    {property.units.filter(u => u.isOccupied).length}
                  </p>
                </div>
                <div className="rounded-full bg-emerald-100 p-3 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Users className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 bg-white shadow-sm dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Available
                  </p>
                  <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-300">
                    {property.units.filter(u => !u.isOccupied).length}
                  </p>
                </div>
                <div className="rounded-full bg-blue-100 p-3 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                  <Home className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Add unit form */}
          {showUnitForm && canManage && (
            <Card className="border-0 bg-white shadow-md dark:bg-gray-900 dark:ring-1 dark:ring-gray-800">
              <CardHeader className="border-b border-gray-100 pb-4 dark:border-gray-800">
                <CardTitle className="text-lg">Add new unit</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleAddUnit} className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Unit Name/Number</Label>
                    <Input
                      value={unitFormData.name}
                      onChange={e => setUnitFormData({ ...unitFormData, name: e.target.value })}
                      placeholder="e.g., Unit 101, Apartment A"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Size (sq ft)</Label>
                    <Input
                      type="number"
                      value={unitFormData.sizeSqFt}
                      onChange={e => setUnitFormData({ ...unitFormData, sizeSqFt: e.target.value })}
                      placeholder="e.g., 800"
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Rent Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={unitFormData.rentAmount}
                      onChange={e =>
                        setUnitFormData({ ...unitFormData, rentAmount: e.target.value })
                      }
                      placeholder="e.g., 1200.00"
                      disabled={submitting}
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowUnitForm(false)
                        setUnitFormData({ name: '', sizeSqFt: '', rentAmount: '' })
                      }}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Creating...' : 'Create Unit'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Units table */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-6">
            <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Units in this property
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Detailed breakdown of each unit, occupancy status, and resident.
                </p>
              </div>
            </div>
            {property.units.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                No units found. {canManage ? 'Use the Add Unit action above to create one.' : ''}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60">
                      <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">
                        Unit
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">
                        Size (sq ft)
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Rent</th>
                      <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">
                        Status
                      </th>
                      <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">
                        Resident
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {property.units.map(unit => (
                      <tr
                        key={unit.id}
                        className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/60 dark:hover:bg-gray-800/60"
                      >
                        <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">
                          {unit.name}
                        </td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                          {unit.sizeSqFt ? `${unit.sizeSqFt.toLocaleString()}` : '-'}
                        </td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                          {unit.rentAmount
                            ? `$${unit.rentAmount.toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}`
                            : '-'}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${
                              unit.isOccupied
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}
                          >
                            {unit.isOccupied ? 'Occupied' : 'Available'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                          {unit.resident ? unit.resident.user.name || unit.resident.user.email : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
