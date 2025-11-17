import { withAuth } from 'next-auth/middleware'

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const path = req.nextUrl.pathname

      if (path.startsWith('/admin')) {
        return token?.role === 'ADMIN' || token?.role === 'MANAGER'
      }

      return !!token
    },
  },
})

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
