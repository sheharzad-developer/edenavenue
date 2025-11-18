'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Label from '@/components/ui/Label'

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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => router.push('/properties')} className="mb-4">
          ← Back to Properties
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{property.name}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{property.address}</p>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Units</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{property.units.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Occupied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              {property.units.filter(u => u.isOccupied).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">
              {property.units.filter(u => !u.isOccupied).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {canManage && (
        <div className="mb-6">
          <Button onClick={() => setShowUnitForm(!showUnitForm)}>
            {showUnitForm ? 'Cancel' : 'Add Unit'}
          </Button>
        </div>
      )}

      {showUnitForm && canManage && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUnit} className="space-y-4">
              <div>
                <Label>Unit Name/Number</Label>
                <Input
                  value={unitFormData.name}
                  onChange={e => setUnitFormData({ ...unitFormData, name: e.target.value })}
                  placeholder="e.g., Unit 101, Apartment A"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Size (sq ft)</Label>
                  <Input
                    type="number"
                    value={unitFormData.sizeSqFt}
                    onChange={e => setUnitFormData({ ...unitFormData, sizeSqFt: e.target.value })}
                    placeholder="e.g., 800"
                    disabled={submitting}
                  />
                </div>
                <div>
                  <Label>Rent Amount ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={unitFormData.rentAmount}
                    onChange={e => setUnitFormData({ ...unitFormData, rentAmount: e.target.value })}
                    placeholder="e.g., 1200.00"
                    disabled={submitting}
                  />
                </div>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Unit'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Units</CardTitle>
        </CardHeader>
        <CardContent>
          {property.units.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No units found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border">
                <thead>
                  <tr>
                    <th className="border px-4 py-2 text-left">Unit Name</th>
                    <th className="border px-4 py-2 text-left">Size (sq ft)</th>
                    <th className="border px-4 py-2 text-left">Rent</th>
                    <th className="border px-4 py-2 text-left">Status</th>
                    <th className="border px-4 py-2 text-left">Resident</th>
                  </tr>
                </thead>
                <tbody>
                  {property.units.map(unit => (
                    <tr key={unit.id} className="border-t">
                      <td className="border px-4 py-2 font-medium">{unit.name}</td>
                      <td className="border px-4 py-2">
                        {unit.sizeSqFt ? `${unit.sizeSqFt.toLocaleString()}` : '-'}
                      </td>
                      <td className="border px-4 py-2">
                        {unit.rentAmount
                          ? `$${unit.rentAmount.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : '-'}
                      </td>
                      <td className="border px-4 py-2">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            unit.isOccupied
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {unit.isOccupied ? 'Occupied' : 'Available'}
                        </span>
                      </td>
                      <td className="border px-4 py-2">
                        {unit.resident ? unit.resident.user.name || unit.resident.user.email : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
