import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/requests/[id] - Get a single request
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Residents can only view their own requests
    if (session.user.role === 'RESIDENT' && request.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ request })
  } catch (error) {
    console.error('Error fetching request:', error)
    return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 })
  }
}

// PATCH /api/requests/[id] - Update request (status, assign staff, etc.)
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { status, priority, assigneeId } = body

    // Check if request exists
    const existingRequest = await prisma.maintenanceRequest.findUnique({
      where: { id },
    })

    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Only Admin, Manager, or Maintenance staff can update requests
    if (!['ADMIN', 'MANAGER', 'MAINTENANCE'].includes(session.user.role)) {
      // Residents can only update their own requests if status is OPEN
      if (session.user.role === 'RESIDENT') {
        if (existingRequest.authorId !== session.user.id) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }
        // Residents can only update if request is still OPEN
        if (existingRequest.status !== 'OPEN') {
          return NextResponse.json(
            { error: 'Cannot update request that is not OPEN' },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }

    // If assigning, verify assignee exists and has appropriate role
    if (assigneeId) {
      const assignee = await prisma.user.findUnique({
        where: { id: assigneeId },
      })

      if (!assignee || !['ADMIN', 'MANAGER', 'MAINTENANCE'].includes(assignee.role)) {
        return NextResponse.json({ error: 'Invalid assignee' }, { status: 400 })
      }
    }

    // Build update data
    const updateData: {
      status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
      assigneeId?: string | null
    } = {}
    if (status && ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      updateData.status = status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    }
    if (priority && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      updateData.priority = priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    }
    if (assigneeId !== undefined) {
      updateData.assigneeId = assigneeId || null
    }

    const request = await prisma.maintenanceRequest.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    })

    return NextResponse.json({ request })
  } catch (error) {
    console.error('Error updating request:', error)
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}
