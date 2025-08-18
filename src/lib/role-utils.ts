import { Role } from '@/types/auth';

export function hasAccess(userRole: Role | null, allowedRoles: Role[]): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole);
}

export function getRoleBasePath(role: Role): string {
  switch (role) {
    case 'MENTOR':
      return '/dashboard/mentor';
    case 'SEEKER':
      return '/dashboard/seeker';
    case 'ADMIN':
      return '/dashboard/admin';
    case 'TECHIE':
    case 'MEMBER':
      return '/dashboard';
    default:
      return '/dashboard';
  }
}

export function isSharedRoute(path: string): boolean {
  const sharedRoutes = [
    '/members',
    '/events',
    '/stories',
    '/settings',
    '/profile',
    '/wellness',
  ];
  
  return sharedRoutes.some(route => path.startsWith(route));
}

export function getRoleFromPath(path: string): Role | null {
  if (path.includes('/mentor')) return 'MENTOR';
  if (path.includes('/seeker')) return 'SEEKER';
  if (path.includes('/admin')) return 'ADMIN';
  return null;
}

export function formatRoleName(role: Role): string {
  return role.charAt(0) + role.slice(1).toLowerCase();
}
