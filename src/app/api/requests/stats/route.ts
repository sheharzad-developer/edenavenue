import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and managers can view statistics
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get counts by status
    const [open, inProgress, resolved, closed, total] = await Promise.all([
      prisma.maintenanceRequest.count({ where: { status: 'OPEN' } }),
      prisma.maintenanceRequest.count({ where: { status: 'IN_PROGRESS' } }),
      prisma.maintenanceRequest.count({ where: { status: 'RESOLVED' } }),
      prisma.maintenanceRequest.count({ where: { status: 'CLOSED' } }),
      prisma.maintenanceRequest.count(),
    ])

    // Get recent requests (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const recentRequests = await prisma.maintenanceRequest.count({
      where: {
        createdAt: {
          gte: yesterday,
        },
      },
    })

    // Get unassigned requests
    const unassigned = await prisma.maintenanceRequest.count({
      where: {
        assigneeId: null,
        status: {
          in: ['OPEN', 'IN_PROGRESS'],
        },
      },
    })

    return NextResponse.json({
      stats: {
        open,
        inProgress,
        resolved,
        closed,
        total,
        recentRequests,
        unassigned,
      },
    })
  } catch (error) {
    console.error('Error fetching request statistics:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}
