import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET /api/requests - List all requests (filtered by role)
export async function GET(req: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    // Build where clause
    const where: {
      authorId?: string
      status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    } = {}

    // Residents can only see their own requests
    if (session.user.role === 'RESIDENT') {
      where.authorId = session.user.id
    }

    // Filter by status if provided
    if (status && ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      where.status = status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    }

    // Filter by priority if provided
    if (priority && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      where.priority = priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

// POST /api/requests - Create a new maintenance request
export async function POST(req: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, priority } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({ request }, { status: 201 })
  } catch (error) {
    console.error('Error creating request:', error)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}
