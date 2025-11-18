import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')

    const where: {
      authorId?: string
      status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    } = {}

    if (session.user.role === 'RESIDENT') {
      where.authorId = session.user.id
    }

    if (status && ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].includes(status)) {
      where.status = status as 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
    }

    if (priority && ['LOW', 'MEDIUM', 'HIGH', 'URGENT'].includes(priority)) {
      where.priority = priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    }

    const requests = await prisma.maintenanceRequest.findMany({
      where,
      include: { author: true, assignedTo: true, comments: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching requests:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, houseNumber, priority } = body

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const request = await prisma.maintenanceRequest.create({
      data: {
        title,
        description,
        houseNumber: houseNumber || null,
        authorId: session.user.id,
        priority: priority || 'MEDIUM',
      },
      include: { author: true, assignedTo: true, comments: true },
    })

    return NextResponse.json({ request }, { status: 201 })
  } catch (error) {
    console.error('Error creating request:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to create request'

    // Check for database schema errors
    if (errorMessage.includes('Unknown column') || errorMessage.includes('houseNumber')) {
      return NextResponse.json(
        {
          error:
            'Database migration needed. Please ensure migrations have been run on the database.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
