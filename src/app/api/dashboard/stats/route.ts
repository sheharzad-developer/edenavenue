import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET() {
  console.log('[Dashboard Stats API] Request received')

  try {
    // Check database connection first
    try {
      console.log('[Dashboard Stats API] Testing database connection...')
      await prisma.$connect()
      console.log('[Dashboard Stats API] Database connected successfully')
    } catch (dbError) {
      console.error('[Dashboard Stats API] Database connection error:', dbError)
      return NextResponse.json(
        {
          error: 'Database connection failed',
          details: process.env.NODE_ENV === 'development' ? String(dbError) : undefined,
        },
        { status: 503 }
      )
    }

    console.log('[Dashboard Stats API] Getting session...')
    const session = await getSession()
    console.log('[Dashboard Stats API] Session:', session ? 'Found' : 'Not found')

    if (!session?.user) {
      console.error('[Dashboard Stats API] No session found')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[Dashboard Stats API] User role:', session.user.role)

    // Only admins and managers can view comprehensive statistics
    if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
      console.error('[Dashboard Stats API] User role not authorized:', session.user.role)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log('[Dashboard Stats API] Fetching statistics...')

    // Get all statistics in parallel with error handling
    const statsPromises = [
      { key: 'totalProperties', promise: prisma.property.count().catch(() => 0) },
      { key: 'totalUnits', promise: prisma.unit.count().catch(() => 0) },
      {
        key: 'occupiedUnits',
        promise: prisma.unit.count({ where: { isOccupied: true } }).catch(() => 0),
      },
      { key: 'totalResidents', promise: prisma.resident.count().catch(() => 0) },
      {
        key: 'totalStaff',
        promise: prisma.user
          .count({ where: { role: { in: ['MANAGER', 'MAINTENANCE'] } } })
          .catch(() => 0),
      },
      { key: 'totalUsers', promise: prisma.user.count().catch(() => 0) },
      {
        key: 'openRequests',
        promise: prisma.maintenanceRequest.count({ where: { status: 'OPEN' } }).catch(() => 0),
      },
      {
        key: 'inProgressRequests',
        promise: prisma.maintenanceRequest
          .count({ where: { status: 'IN_PROGRESS' } })
          .catch(() => 0),
      },
      {
        key: 'resolvedRequests',
        promise: prisma.maintenanceRequest.count({ where: { status: 'RESOLVED' } }).catch(() => 0),
      },
      { key: 'totalRequests', promise: prisma.maintenanceRequest.count().catch(() => 0) },
      {
        key: 'recentRequests',
        promise: prisma.maintenanceRequest
          .count({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
              },
            },
          })
          .catch(() => 0),
      },
      {
        key: 'unassignedRequests',
        promise: prisma.maintenanceRequest
          .count({
            where: {
              assigneeId: null,
              status: { in: ['OPEN', 'IN_PROGRESS'] },
            },
          })
          .catch(() => 0),
      },
      { key: 'totalNotices', promise: prisma.notice.count().catch(() => 0) },
      {
        key: 'publishedNotices',
        promise: prisma.notice.count({ where: { isPublished: true } }).catch(() => 0),
      },
      {
        key: 'urgentNotices',
        promise: prisma.notice
          .count({ where: { priority: 'URGENT', isPublished: true } })
          .catch(() => 0),
      },
      { key: 'totalComments', promise: prisma.comment.count().catch(() => 0) },
    ]

    console.log('[Dashboard Stats API] Executing queries...')
    const results = await Promise.all(statsPromises.map(s => s.promise))
    console.log('[Dashboard Stats API] Queries completed, results:', results.length)

    const statsMap: Record<string, number> = {}
    statsPromises.forEach((s, i) => {
      const value = results[i]
      statsMap[s.key] = typeof value === 'number' ? value : 0
      if (typeof value !== 'number') {
        console.warn(`[Dashboard Stats API] Non-numeric result for ${s.key}:`, value)
      }
    })
    console.log('[Dashboard Stats API] Stats map created:', Object.keys(statsMap).length, 'keys')

    // Ensure all values have defaults
    const totalProperties = statsMap.totalProperties ?? 0
    const totalUnits = statsMap.totalUnits ?? 0
    const occupiedUnits = statsMap.occupiedUnits ?? 0
    const totalResidents = statsMap.totalResidents ?? 0
    const totalStaff = statsMap.totalStaff ?? 0
    const totalUsers = statsMap.totalUsers ?? 0
    const openRequests = statsMap.openRequests ?? 0
    const inProgressRequests = statsMap.inProgressRequests ?? 0
    const resolvedRequests = statsMap.resolvedRequests ?? 0
    const totalRequests = statsMap.totalRequests ?? 0
    const recentRequests = statsMap.recentRequests ?? 0
    const unassignedRequests = statsMap.unassignedRequests ?? 0
    const totalNotices = statsMap.totalNotices ?? 0
    const publishedNotices = statsMap.publishedNotices ?? 0
    const urgentNotices = statsMap.urgentNotices ?? 0
    const totalComments = statsMap.totalComments ?? 0

    // Get current month stats
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const requestsThisMonth = await prisma.maintenanceRequest
      .count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      })
      .catch(() => 0)

    // Get most frequently requested item (by title similarity - simplified)
    let frequentRequest = 'N/A'
    try {
      const allRequests = await prisma.maintenanceRequest.findMany({
        select: { title: true },
        take: 100, // Limit to prevent memory issues
      })
      if (allRequests.length > 0) {
        const requestTitles = allRequests.map(r => r.title.toLowerCase())
        const titleCounts: Record<string, number> = {}
        requestTitles.forEach(title => {
          const key = title.split(' ')[0] // Simple grouping by first word
          titleCounts[key] = (titleCounts[key] || 0) + 1
        })
        frequentRequest = Object.entries(titleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
      }
    } catch (error) {
      console.error('Error calculating frequent request:', error)
      frequentRequest = 'N/A'
    }

    const responseData = {
      stats: {
        properties: {
          total: totalProperties,
          units: totalUnits,
          occupiedUnits,
        },
        residents: {
          total: totalResidents,
        },
        staff: {
          total: totalStaff,
        },
        users: {
          total: totalUsers,
        },
        requests: {
          open: openRequests,
          inProgress: inProgressRequests,
          resolved: resolvedRequests,
          total: totalRequests,
          recent: recentRequests,
          unassigned: unassignedRequests,
          thisMonth: requestsThisMonth,
          frequentRequest,
        },
        notices: {
          total: totalNotices,
          published: publishedNotices,
          urgent: urgentNotices,
        },
        comments: {
          total: totalComments,
        },
      },
    }

    console.log('[Dashboard Stats API] Response data prepared successfully')
    return NextResponse.json(responseData)
  } catch (error) {
    console.error('[Dashboard Stats API] ERROR:', error)
    console.error('[Dashboard Stats API] Error type:', error?.constructor?.name)
    console.error(
      '[Dashboard Stats API] Error message:',
      error instanceof Error ? error.message : String(error)
    )
    console.error(
      '[Dashboard Stats API] Error stack:',
      error instanceof Error ? error.stack : 'No stack trace'
    )

    let errorMessage = 'Failed to fetch statistics'
    let errorDetails = 'Unknown error'

    if (error instanceof Error) {
      errorDetails = error.message
      errorMessage = error.message

      // Check for common Prisma/database errors
      if (
        error.message.includes('fetch failed') ||
        error.message.includes('Cannot fetch data') ||
        error.message.includes("Can't reach database server") ||
        error.message.includes('P1001') ||
        error.message.includes('P1000')
      ) {
        errorMessage = 'Database connection failed. Please check your DATABASE_URL.'
      } else if (
        error.message.includes('Unknown model') ||
        error.message.includes('does not exist') ||
        error.message.includes('P2001') ||
        error.message.includes('relation') ||
        error.message.includes('table')
      ) {
        errorMessage = 'Database migration needed. Please run: npx prisma migrate deploy'
      } else if (error.message.includes('P2002') || error.message.includes('Unique constraint')) {
        errorMessage = 'Database constraint violation'
      } else if (error.message.includes('P2003')) {
        errorMessage = 'Invalid database reference'
      } else if (error.message.includes('P2025')) {
        errorMessage = 'Record not found in database'
      }
    }

    const errorResponse = {
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined,
      stack:
        process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    }

    console.error('[Dashboard Stats API] Returning error response:', errorResponse)
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
