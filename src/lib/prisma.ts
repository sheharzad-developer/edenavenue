import { PrismaClient } from '@prisma/client'

declare global {
  // allow global to persist across module reloads in development
  var prisma: PrismaClient | undefined
}

// Create Prisma Client with connection pooling settings for serverless
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })
}

const prisma = global.prisma ?? createPrismaClient()

// In development, reuse the same instance
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

// Handle connection errors and reconnection
prisma.$on('error' as never, (e: unknown) => {
  console.error('Prisma error:', e)
})

export default prisma
