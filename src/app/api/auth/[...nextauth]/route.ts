import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required')
        }

        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } })

          if (!user) {
            throw new Error('Invalid email or password')
          }

          if (!user.password) {
            throw new Error('User account has no password set')
          }

          const valid = await bcrypt.compare(credentials.password, user.password)

          if (!valid) {
            throw new Error('Invalid email or password')
          }

          return { id: user.id, email: user.email, name: user.name, role: user.role }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      },
    }),
  ],
  session: { strategy: 'jwt' as const },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: { role?: string; id?: string }
      user?: { id: string; role: string }
    }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    async session({
      session,
      token,
    }: {
      session: { user?: { id?: string; role?: string } }
      token: { id?: string; role?: string }
    }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/login',
  },
  // Explicitly set the base URL for Vercel
  useSecureCookies: process.env.NEXTAUTH_URL?.startsWith('https://') ?? true,
  cookies: {
    sessionToken: {
      name: `${process.env.NEXTAUTH_URL?.startsWith('https://') ? '__Secure-' : ''}next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NEXTAUTH_URL?.startsWith('https://') ?? true,
      },
    },
  },
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler = (NextAuth as any)(authOptions)

export { handler as GET, handler as POST }
