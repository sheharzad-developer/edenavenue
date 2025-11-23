import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { Prisma, NoticeType, NoticePriority } from '@prisma/client'

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const published = searchParams.get('published')
    const type = searchParams.get('type')

    const where: Prisma.NoticeWhereInput = {}

    // Residents can only see published notices
    if (session.user.role === 'RESIDENT') {
      where.isPublished = true
      where.expiresAt = { gte: new Date() }
    } else if (published === 'true') {
      where.isPublished = true
    }

    if (type && Object.values(NoticeType).includes(type as NoticeType)) {
      where.type = type as NoticeType
    }

    const notices = await prisma.notice.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ notices })
  } catch (error) {
    console.error('Error fetching notices:', error)
    return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { title, content, type, priority, isPublished, expiresAt } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const notice = await prisma.notice.create({
      data: {
        title,
        content,
        type: (type as NoticeType) || NoticeType.GENERAL,
        priority: (priority as NoticePriority) || NoticePriority.NORMAL,
        isPublished: isPublished || false,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
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

    return NextResponse.json({ notice }, { status: 201 })
  } catch (error) {
    console.error('Error creating notice:', error)
    return NextResponse.json({ error: 'Failed to create notice' }, { status: 500 })
  }
}
