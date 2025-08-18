import { Role } from '@/types/auth';

export interface NavigationItem {
  name: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
}

export type RoleNavigation = {
  [key in Role]: NavigationItem[];
};

// Shared navigation items available to all roles
const sharedNavigation: NavigationItem[] = [
  { name: 'Members', href: '/members' },
  { name: 'Stories', href: '/stories' },
  { name: 'Settings', href: '/settings' },
  { name: 'Profile', href: '/profile' },
  { name: 'Wellness', href: '/wellness' },
];

// Role-specific base paths
const roleBasePaths = {
  MENTOR: {
    dashboard: '/dashboard/mentor',
    connect: '/connect/mentor',
    events: '/events/mentor',
    mentorship: '/mentorship/mentor',
  },
  SEEKER: {
    dashboard: '/dashboard/seeker',
    connect: '/connect/seeker',
    events: '/events/seeker',
    mentorship: '/mentorship/seeker',
  },
  ADMIN: {
    dashboard: '/dashboard/admin',
  },
};

export const navigationConfig: RoleNavigation = {
  MENTOR: [
    { name: 'Dashboard', href: roleBasePaths.MENTOR.dashboard },
    { name: 'Connect', href: roleBasePaths.MENTOR.connect },
    { name: 'Mentorship', href: roleBasePaths.MENTOR.mentorship },
    { name: 'Events', href: roleBasePaths.MENTOR.events },
    ...sharedNavigation,
  ],
  SEEKER: [
    { name: 'Dashboard', href: roleBasePaths.SEEKER.dashboard },
    { name: 'Connect', href: roleBasePaths.SEEKER.connect },
    { name: 'Mentorship', href: roleBasePaths.SEEKER.mentorship },
    { name: 'Events', href: roleBasePaths.SEEKER.events },
    ...sharedNavigation,
  ],
  TECHIE: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Connect', href: '/connect' },
    { name: 'Events', href: '/events' },
    ...sharedNavigation,
  ],
  MEMBER: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Events', href: '/events' },
    ...sharedNavigation,
  ],
  ADMIN: [
    { name: 'Dashboard', href: roleBasePaths.ADMIN.dashboard },
    { name: 'Users', href: '/admin/users' },
    { name: 'Analytics', href: '/admin/analytics' },
    { name: 'Settings', href: '/admin/settings' },
  ],
};
