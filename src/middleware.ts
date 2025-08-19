
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { Role } from '@/types/auth';

// This middleware is now simplified to only handle authentication state,
// as the firebase-admin SDK is not compatible with the Edge runtime.
// Role-based logic is handled by the client-side AuthGuard and navigation hooks.

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password', '/', '/admin/login', '/admin'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip middleware for API routes and static assets
  if (path.startsWith('/api/') || path.startsWith('/_next/') || path.includes('.')) {
    return NextResponse.next();
  }

  // Get the Firebase Auth token from the cookie
  const authToken = request.cookies.get('firebase-auth-token')?.value;
  const tokenExpiry = request.cookies.get('firebase-token-expiry')?.value;
  const now = Date.now();

  const isPublicRoute = PUBLIC_ROUTES.some(route => path === route);
  const isAdminAuthRoute = path === '/admin/login' || path === '/admin';

  // Check if token is missing or expired
  const isValidToken = authToken && tokenExpiry && parseInt(tokenExpiry) > now;

  // If the user is not authenticated or token is expired
  if (!isValidToken) {
    // Clear any existing invalid tokens
    const response = NextResponse.redirect(
      new URL(isPublicRoute ? path : '/login', request.url)
    );
    response.cookies.delete('firebase-auth-token');
    response.cookies.delete('firebase-token-expiry');

    // If they are trying to access a protected route, redirect to the appropriate login
    if (!isPublicRoute) {
      if (path.startsWith('/admin/')) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
      return response;
    }
    // Otherwise, allow access to the public route with cleared tokens
    return isPublicRoute ? NextResponse.next() : response;
  }

  // If the user IS authenticated
  if (authToken) {
    // If they are trying to access a public, non-admin auth page, redirect them to the dashboard.
    // This prevents logged-in users from seeing the main landing, login, or signup pages.
    if (isPublicRoute && !isAdminAuthRoute && path !== '/') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
     // A full token verification with role checking is too heavy for middleware
     // and requires the Admin SDK. This logic is now handled in client-side
     // components and layouts which have the full user context from `useAuth`.
  }

  return NextResponse.next();
}

export const config = {
    matcher: [
      /*
       * Match all request paths except for the ones starting with:
       * - api (API routes)
       * - _next/static (static files)
       * - _next/image (image optimization files)
       * - favicon.ico (favicon file)
       */
      '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
