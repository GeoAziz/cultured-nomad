import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth, db } from '@/lib/firebase/firebase_config';
import { doc, getDoc } from 'firebase/firestore';
import { Role } from '@/types/auth';

// Define route access patterns
const ROUTE_ACCESS: Record<string, Role[]> = {
  '/dashboard/mentor': ['MENTOR'],
  '/dashboard/seeker': ['SEEKER'],
  '/dashboard/admin': ['ADMIN'],
  '/connect/mentor': ['MENTOR'],
  '/connect/seeker': ['SEEKER'],
  '/mentorship/mentor': ['MENTOR'],
  '/mentorship/seeker': ['SEEKER'],
  '/events/mentor': ['MENTOR'],
  '/events/seeker': ['SEEKER'],
};

// Define shared routes that all authenticated users can access
const SHARED_ROUTES = [
  '/members',
  '/events',
  '/stories',
  '/settings',
  '/profile',
  '/wellness',
];

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/forgot-password',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Allow public routes
  if (PUBLIC_ROUTES.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Get the session data
  const sessionData = request.cookies.get('session')?.value;
  
  // If no session, redirect to login
  if (!sessionData && !PUBLIC_ROUTES.includes(path)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Special handling for /connect root path
  if (path === '/connect' && sessionData) {
    try {
      const userDoc = await getDoc(doc(db, 'users', sessionData));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        switch(userData.role.toUpperCase() as Role) {
          case 'MENTOR':
            return NextResponse.redirect(new URL('/connect/mentor', request.url));
          case 'SEEKER':
            return NextResponse.redirect(new URL('/connect/seeker', request.url));
          default:
            return NextResponse.next();
        }
      }
    } catch (error) {
      console.error('Error in middleware:', error);
    }
  }

  // Check role-based access for protected routes
  if (sessionData) {
    try {
      const userDoc = await getDoc(doc(db, 'users', sessionData));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role.toUpperCase() as Role;

        // Check if trying to access a protected route
        const protectedRoute = Object.entries(ROUTE_ACCESS).find(([route]) => 
          path.startsWith(route)
        );

        if (protectedRoute) {
          const [route, allowedRoles] = protectedRoute;
          if (!allowedRoles.includes(userRole)) {
            // Redirect to appropriate dashboard based on role
            return NextResponse.redirect(new URL(`/dashboard/${userRole.toLowerCase()}`, request.url));
          }
        }

        // Allow access to shared routes for authenticated users
        if (SHARED_ROUTES.some(route => path.startsWith(route))) {
          return NextResponse.next();
        }
      }
    } catch (error) {
      console.error('Error in middleware:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}
