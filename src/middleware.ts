import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/server/firebase-admin';
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

  // Skip middleware for static assets
  const assetExtensions = ['.js', '.css', '.ico', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.woff', '.woff2', '.ttf', '.map', '.json'];
  if (assetExtensions.some(ext => path.endsWith(ext))) {
    return NextResponse.next();
  }

  // Allow public routes
  if (PUBLIC_ROUTES.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Get the Firebase Auth token from cookie
  const authToken = request.cookies.get('firebase-auth-token')?.value;

  // If no auth token and not a public route, redirect to login
  if (!authToken && !PUBLIC_ROUTES.includes(path)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  let userId: string | null = null;
  
  if (authToken) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(authToken);
      userId = decodedToken.uid;
    } catch (error) {
      console.error('Error verifying auth token:', error);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (!userId) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Get user data from Firestore
    const userDoc = await adminDb.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const userData = userDoc.data();
    if (!userData) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const userRole = userData.role.toUpperCase() as Role;

    // Special handling for /connect root path
    if (path === '/connect') {
      switch(userRole) {
        case 'MENTOR':
          return NextResponse.redirect(new URL('/connect/mentor', request.url));
        case 'SEEKER':
          return NextResponse.redirect(new URL('/connect/seeker', request.url));
        default:
          return NextResponse.next();
      }
    }

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
    
  } catch (error) {
    console.error('Error in middleware:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
