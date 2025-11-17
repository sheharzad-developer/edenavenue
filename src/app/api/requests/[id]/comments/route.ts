import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// POST /api/requests/[id]/comments - Add a comment to a request
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const { body: commentBody } = body

    if (!commentBody || !commentBody.trim()) {
      return NextResponse.json({ error: 'Comment body is required' }, { status: 400 })
    }

    // Check if request exists
    const request = await prisma.maintenanceRequest.findUnique({
      where: { id },
    })

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    // Residents can only comment on their own requests
    if (session.user.role === 'RESIDENT' && request.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const comment = await prisma.comment.create({
      data: {
        body: commentBody.trim(),
        authorId: session.user.id,
        requestId: id,
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

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }
}
