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
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: { author: true, assignedTo: true, comments: true },
    })

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (session.user.role === 'RESIDENT' && request.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ request })
  } catch (error) {
    console.error('Error fetching request:', error)
    return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { status, assigneeId, priority } = await req.json()

    const existing = await prisma.maintenanceRequest.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    if (!['ADMIN', 'MANAGER', 'MAINTENANCE'].includes(session.user.role)) {
      if (session.user.role === 'RESIDENT' && existing.authorId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      if (session.user.role !== 'RESIDENT') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    const updateData: {
      status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
      assigneeId?: string | null
    } = {}

    if (status) updateData.status = status
    if (priority) updateData.priority = priority
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: updateData,
      include: { author: true, assignedTo: true, comments: true },
    })

    return NextResponse.json({ updated })
  } catch (error) {
    console.error('Error updating request:', error)
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}
