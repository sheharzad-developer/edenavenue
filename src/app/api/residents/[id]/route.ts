import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const resident = await prisma.resident.findUnique({
      where: { id },
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
    })

    if (!resident) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    return NextResponse.json({ resident })
  } catch (error) {
    console.error('Error fetching resident:', error)
    return NextResponse.json({ error: 'Failed to fetch resident' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
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
    const { unitId, phone, moveIn, moveOut } = body

    const updateData: {
      unitId?: string | null
      phone?: string | null
      moveIn?: Date | null
      moveOut?: Date | null
    } = {}

    // Handle unit change
    const currentResident = await prisma.resident.findUnique({
      where: { id },
      select: { unitId: true },
    })

    if (unitId !== undefined) {
      if (unitId === null || unitId === '') {
        // Remove from unit
        if (currentResident?.unitId) {
          await prisma.unit.update({
            where: { id: currentResident.unitId },
            data: { isOccupied: false },
          })
        }
        updateData.unitId = null
      } else {
        // Assign to new unit
        const unit = await prisma.unit.findUnique({
          where: { id: unitId },
        })

        if (!unit) {
          return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
        }

        // Free old unit
        if (currentResident?.unitId && currentResident.unitId !== unitId) {
          await prisma.unit.update({
            where: { id: currentResident.unitId },
            data: { isOccupied: false },
          })
        }

        // Occupy new unit
        await prisma.unit.update({
          where: { id: unitId },
          data: { isOccupied: true },
        })

        updateData.unitId = unitId
      }
    }

    if (phone !== undefined) updateData.phone = phone || null
    if (moveIn !== undefined) updateData.moveIn = moveIn ? new Date(moveIn) : null
    if (moveOut !== undefined) updateData.moveOut = moveOut ? new Date(moveOut) : null

    const resident = await prisma.resident.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json({ resident })
  } catch (error) {
    console.error('Error updating resident:', error)
    return NextResponse.json({ error: 'Failed to update resident' }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
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

    const resident = await prisma.resident.findUnique({
      where: { id },
      select: { unitId: true },
    })

    // Free the unit if assigned
    if (resident?.unitId) {
      await prisma.unit.update({
        where: { id: resident.unitId },
        data: { isOccupied: false },
      })
    }

    await prisma.resident.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting resident:', error)
    return NextResponse.json({ error: 'Failed to delete resident' }, { status: 500 })
  }
}
