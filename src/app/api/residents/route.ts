import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const residents = await prisma.resident.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
      orderBy: {
        moveIn: 'desc',
      },
    })

    return NextResponse.json({ residents })
  } catch (error) {
    console.error('Error fetching residents:', error)
    let errorMessage = 'Failed to fetch residents'

    if (error instanceof Error) {
      errorMessage = error.message
      // Check for common Prisma errors
      if (
        error.message.includes('fetch failed') ||
        error.message.includes('Cannot fetch data') ||
        error.message.includes("Can't reach database server") ||
        error.message.includes('P1001')
      ) {
        errorMessage = 'Database connection failed. Please check your DATABASE_URL.'
      } else if (error.message.includes('Unknown model') || error.message.includes('Resident')) {
        errorMessage = 'Database migration needed. Please run: npx prisma migrate deploy'
      } else if (error.message.includes('P2002') || error.message.includes('Unique constraint')) {
        errorMessage = 'Database constraint violation'
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, unitId, phone, moveIn } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Check if user exists and is a RESIDENT
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.role !== 'RESIDENT') {
      return NextResponse.json({ error: 'User must have RESIDENT role' }, { status: 400 })
    }

    // If unitId provided, check if unit exists and update its occupancy
    if (unitId) {
      const unit = await prisma.unit.findUnique({
        where: { id: unitId },
      })

      if (!unit) {
        return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
      }

      // Update unit to occupied
      await prisma.unit.update({
        where: { id: unitId },
        data: { isOccupied: true },
      })
    }

    const resident = await prisma.resident.create({
      data: {
        userId,
        unitId: unitId || null,
        phone: phone || null,
        moveIn: moveIn ? new Date(moveIn) : new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        unit: {
          include: {
            property: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json({ resident }, { status: 201 })
  } catch (error) {
    console.error('Error creating resident:', error)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Resident already exists for this user' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create resident' }, { status: 500 })
  }
}
