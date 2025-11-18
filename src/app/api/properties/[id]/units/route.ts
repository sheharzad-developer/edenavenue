import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { name, sizeSqFt, rentAmount } = body

    if (!name) {
      return NextResponse.json({ error: 'Unit name is required' }, { status: 400 })
    }

    // Verify property exists
    const property = await prisma.property.findUnique({
      where: { id },
    })

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    const unit = await prisma.unit.create({
      data: {
        name,
        propertyId: id,
        sizeSqFt: sizeSqFt || null,
        rentAmount: rentAmount || null,
      },
    })

    return NextResponse.json({ unit }, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
  }
}
