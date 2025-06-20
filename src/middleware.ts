import { NextResponse, type NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

// Define public routes (accessible without authentication)
const publicRoutes = ['/sign-in', '/sign-up', '/']

// Define protected routes with role-based access
const protectedRoutes = ["/admin", "/employee", "/hr"]

const roleBasedRoutes: Record<string, string[]> = {
  admin: ['/admin'],
  superadmin: ['/admin'],
  hr: ['/hr'],
  employee: ['/employee'],
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublicRoute = publicRoutes.includes(path)
  const isProtectedRoute = protectedRoutes.includes(path)
  const sessionCookie = request.cookies.get('session')?.value

  // Redirect to /user if logged in and on a public route
  if (sessionCookie && isPublicRoute) {
    try {
      const session = await decrypt(sessionCookie)
      if (session?.userId) {
        return NextResponse.redirect(new URL('/user', request.url))
      }
    } catch {
      // Ignore invalid session on public routes
    }
  }

  // Redirect to /sign-in if not logged in and on a protected route
  if (!sessionCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Handle role-based access for authenticated users
  if (sessionCookie && !isPublicRoute) {
    try {
      const session = await decrypt(sessionCookie)
      const userRole = session?.role as keyof typeof roleBasedRoutes

      // Allow access to /user for all authenticated users
      if (path === '/user') {
        return NextResponse.next()
      }

      // If no role, redirect to /user from any other protected page
      if (!userRole) {
        return NextResponse.redirect(new URL('/user', request.url))
      }

      // Check for role-based access
      const allowedPaths = roleBasedRoutes[userRole]
      if (allowedPaths && allowedPaths.some(p => path.startsWith(p))) {
        return NextResponse.next()
      }

      // If not allowed, redirect to /user
      return NextResponse.redirect(new URL('/user', request.url))
    } catch {
      // If session is invalid, redirect to sign-in and clear cookie
      const response = NextResponse.redirect(new URL('/sign-in', request.url))
      response.cookies.delete('session')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}