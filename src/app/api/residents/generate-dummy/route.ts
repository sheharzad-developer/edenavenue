import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== 'ADMIN' && userRole !== 'MANAGER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create dummy properties if they don't exist
    let property1 = await prisma.property.findFirst({ where: { name: 'Eden Gardens' } })
    if (!property1) {
      property1 = await prisma.property.create({
        data: {
          name: 'Eden Gardens',
          address: '123 Garden Avenue, City, State 12345',
        },
      })
    }

    let property2 = await prisma.property.findFirst({ where: { name: 'Eden Heights' } })
    if (!property2) {
      property2 = await prisma.property.create({
        data: {
          name: 'Eden Heights',
          address: '456 Heights Boulevard, City, State 12345',
        },
      })
    }

    // Create dummy units if they don't exist
    const units = []
    const unitNames = ['101', '102', '201', '202', '301', '302', '401', '402']

    for (let i = 0; i < unitNames.length; i++) {
      const property = i < 4 ? property1 : property2
      let unit = await prisma.unit.findFirst({
        where: {
          name: unitNames[i],
          propertyId: property.id,
        },
      })

      if (!unit) {
        unit = await prisma.unit.create({
          data: {
            name: unitNames[i],
            propertyId: property.id,
            sizeSqFt: 800 + Math.floor(Math.random() * 400),
            rentAmount: 1200 + Math.floor(Math.random() * 800),
            isOccupied: false,
          },
        })
      }
      units.push(unit)
    }

    // Dummy resident data
    const dummyResidents = [
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '+1-555-0101',
        unitIndex: 0,
        moveIn: new Date(2023, 0, 15),
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1-555-0102',
        unitIndex: 1,
        moveIn: new Date(2023, 2, 20),
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        phone: '+1-555-0103',
        unitIndex: 2,
        moveIn: new Date(2023, 4, 10),
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '+1-555-0104',
        unitIndex: 3,
        moveIn: new Date(2023, 6, 5),
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@example.com',
        phone: '+1-555-0105',
        unitIndex: 4,
        moveIn: new Date(2023, 8, 12),
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@example.com',
        phone: '+1-555-0106',
        unitIndex: 5,
        moveIn: new Date(2023, 10, 18),
      },
      {
        name: 'Robert Taylor',
        email: 'robert.taylor@example.com',
        phone: '+1-555-0107',
        unitIndex: 6,
        moveIn: new Date(2024, 0, 8),
      },
      {
        name: 'Jennifer Martinez',
        email: 'jennifer.martinez@example.com',
        phone: '+1-555-0108',
        unitIndex: 7,
        moveIn: new Date(2024, 1, 22),
      },
    ]

    const hashedPassword = await bcrypt.hash('password123', 10)
    const createdResidents = []

    for (const dummy of dummyResidents) {
      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email: dummy.email },
      })

      if (!user) {
        // Create user
        user = await prisma.user.create({
          data: {
            name: dummy.name,
            email: dummy.email,
            password: hashedPassword,
            role: 'RESIDENT',
          },
        })
      }

      // Check if resident already exists
      const existingResident = await prisma.resident.findUnique({
        where: { userId: user.id },
      })

      if (!existingResident) {
        const unit = units[dummy.unitIndex]

        // Create resident
        const resident = await prisma.resident.create({
          data: {
            userId: user.id,
            unitId: unit.id,
            phone: dummy.phone,
            moveIn: dummy.moveIn,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            unit: {
              include: {
                property: {
                  select: {
                    id: true,
                    name: true,
                    address: true,
                  },
                },
              },
            },
          },
        })

        // Update unit to occupied
        await prisma.unit.update({
          where: { id: unit.id },
          data: { isOccupied: true },
        })

        createdResidents.push(resident)
      }
    }

    return NextResponse.json({
      message: `Generated ${createdResidents.length} dummy residents`,
      residents: createdResidents,
      created: createdResidents.length,
      skipped: dummyResidents.length - createdResidents.length,
    })
  } catch (error) {
    console.error('Error generating dummy residents:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate dummy residents',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
