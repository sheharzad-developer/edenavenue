import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import prisma from '@/lib/prisma'

// Simple test endpoint to diagnose issues
export async function GET() {
  try {
    const checks = {
      timestamp: new Date().toISOString(),
      database: 'unknown',
      session: 'unknown',
      userRole: 'unknown',
    }

    // Test database connection
    try {
      await prisma.$queryRaw`SELECT 1`
      checks.database = 'connected'
    } catch (error) {
      checks.database = `error: ${error instanceof Error ? error.message : String(error)}`
    }

    // Test session
    try {
      const session = await getSession()
      if (session?.user) {
        checks.session = 'authenticated'
        checks.userRole = session.user.role || 'no role'
      } else {
        checks.session = 'not authenticated'
      }
    } catch (error) {
      checks.session = `error: ${error instanceof Error ? error.message : String(error)}`
    }

    return NextResponse.json({ checks }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Test endpoint failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
