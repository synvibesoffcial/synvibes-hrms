import { NextResponse, type NextRequest } from 'next/server';
import { decrypt } from '@/lib/session';

// Define public routes (accessible without authentication)
const publicRoutes = ['/sign-in', '/sign-up', '/', '/accept-invitation', '/onboarding', '/verify-email', '/verify-email-sent', '/forgot-password', '/reset-password'];

// Define routes that require email verification
const emailVerificationRoutes = ['/verify-email', '/verify-email-sent'];

// Define protected routes with role-based access
const protectedRoutes = ['/admin', '/employee', '/hr', '/superadmin'];

// Map roles to their default redirect paths
const roleBasedRedirects: Record<string, string> = {
  superadmin: '/superadmin',
  admin: '/admin',
  hr: '/hr',
  employee: '/employee',
};

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path) || path.startsWith('/accept-invitation') || path.startsWith('/onboarding');
  const isEmailVerificationRoute = emailVerificationRoutes.includes(path) || path.startsWith('/verify-email');
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const sessionCookie = request.cookies.get('session')?.value;

  // Handle email verification routes
  if (isEmailVerificationRoute) {
    // Allow access to email verification routes regardless of session status
    return NextResponse.next();
  }

  // Redirect authenticated users from public routes to their role-specific page or /user
  if (sessionCookie && isPublicRoute && !isEmailVerificationRoute) {
    try {
      const session = await decrypt(sessionCookie);
      if (session?.userId) {
        // Check if email is verified
        if (session?.emailVerified === false) {
          // Redirect unverified users to verification sent page
          return NextResponse.redirect(new URL('/verify-email-sent', request.url));
        }

        const userRole = session?.role as keyof typeof roleBasedRedirects;
        // If user has a role, redirect to their role-specific page
        if (userRole && roleBasedRedirects[userRole]) {
          return NextResponse.redirect(new URL(roleBasedRedirects[userRole], request.url));
        }
        // If no role, redirect to /user
        return NextResponse.redirect(new URL('/user', request.url));
      }
    } catch (error) {
      console.error('Session decryption error:', error);
      // Ignore invalid session on public routes
    }
  }

  // Redirect unauthenticated users to /sign-in for non-public routes
  if (!sessionCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }

  // Handle role-based access for authenticated users on protected routes
  if (sessionCookie && !isPublicRoute) {
    try {
      const session = await decrypt(sessionCookie);
      
      // Check email verification for all authenticated routes
      if (session?.emailVerified === false) {
        return NextResponse.redirect(new URL('/verify-email-sent', request.url));
      }

      const userRole = session?.role as keyof typeof roleBasedRedirects;

      // Allow access to /user for authenticated users with no role
      if (path === '/user' && !userRole) {
        return NextResponse.next();
      }

      // If accessing /user with a role, redirect to role-specific page
      if (path === '/user' && userRole && roleBasedRedirects[userRole]) {
        return NextResponse.redirect(new URL(roleBasedRedirects[userRole], request.url));
      }

      // If no role and trying to access a protected route, redirect to /user
      if (!userRole && isProtectedRoute) {
        return NextResponse.redirect(new URL('/user', request.url));
      }

      // Check role-based access for protected routes
      if (isProtectedRoute) {
        const allowedPaths = roleBasedRedirects[userRole]?.split('/').filter(Boolean);
        if (allowedPaths && path.startsWith(`/${allowedPaths[0]}`)) {
          return NextResponse.next();
        }
        // If not allowed, redirect to role-specific page or /user
        return NextResponse.redirect(
          new URL(userRole && roleBasedRedirects[userRole] ? roleBasedRedirects[userRole] : '/user', request.url)
        );
      }

      return NextResponse.next();
    } catch (error) {
      console.error('Middleware error:', error);
      const response = NextResponse.redirect(new URL('/sign-in', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};