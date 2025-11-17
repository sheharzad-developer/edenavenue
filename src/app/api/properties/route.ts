import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const properties = await prisma.property.findMany({ include: { units: true } })
  return NextResponse.json({ properties })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { name, address } = body
  if (!name || !address) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  const prop = await prisma.property.create({ data: { name, address } })
  return NextResponse.json({ property: prop }, { status: 201 })
}