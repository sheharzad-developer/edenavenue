import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, name, role } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Validate role
    const validRoles = ['ADMIN', 'MANAGER', 'RESIDENT', 'MAINTENANCE']
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: `Invalid role. Must be one of: ${validRoles.join(', ')}` },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: role || 'RESIDENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    let errorMessage = 'Failed to create user'

    if (error instanceof Error) {
      errorMessage = error.message
      // Check for common Prisma errors
      if (
        error.message.includes('fetch failed') ||
        error.message.includes('Cannot fetch data') ||
        error.message.includes("Can't reach database server") ||
        error.message.includes('P1001')
      ) {
        errorMessage =
          'Database connection failed. Please check your DATABASE_URL in .env file and ensure your database server is running. See DATABASE_SETUP.md for help.'
      } else if (error.message.includes('Unique constraint') || error.message.includes('P2002')) {
        errorMessage = 'Email already exists'
      } else if (error.message.includes('Invalid value') || error.message.includes('P2003')) {
        errorMessage = 'Invalid role value. Must be ADMIN, MANAGER, RESIDENT, or MAINTENANCE'
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
