import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import type { Session } from 'next-auth'

export const getSession = async (): Promise<Session | null> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await getServerSession(authOptions as any)
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
}
