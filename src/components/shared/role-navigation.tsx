"use client";

import { useAuth } from '@/hooks/use-auth';
import { useRoleFeatures } from '@/hooks/use-role-features';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Calendar,
  BookOpen,
  MessageSquare,
  Heart,
  Settings,
  Lightbulb,
  Code,
  Target,
  BookMarked,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: any;
  roles?: string[];
}

const baseNavItems: NavItem[] = [
  { href: '/dashboard/mentor', label: 'Mentor Dashboard', icon: LayoutDashboard, roles: ['mentor'] },
  { href: '/dashboard/seeker', label: 'Seeker Dashboard', icon: LayoutDashboard, roles: ['seeker'] },
  { href: '/dashboard/admin', label: 'Admin Dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { href: '/members', label: 'Directory', icon: Users },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/stories', label: 'Stories', icon: BookOpen },
];

const roleSpecificItems: Record<string, NavItem[]> = {
  mentor: [
    { href: '/mentorship/sessions', label: 'Sessions', icon: MessageSquare },
    { href: '/mentorship/resources', label: 'Resources', icon: BookMarked },
  ],
  seeker: [
    { href: '/mentorship/find', label: 'Find Mentor', icon: Target },
    { href: '/mentorship/learning', label: 'Learning Path', icon: Lightbulb },
  ],
  techie: [
    { href: '/tech/projects', label: 'Projects', icon: Code },
    { href: '/tech/resources', label: 'Resources', icon: BookMarked },
  ],
  member: [
    { href: '/wellness', label: 'Wellness', icon: Heart },
  ],
};

export default function RoleNavigation() {
  const { user } = useAuth();
  const pathname = usePathname();
  const roleFeatures = useRoleFeatures();

  if (!user) return null;

  const roleItems = roleSpecificItems[user.role] || roleSpecificItems.member;
  const navItems = [...baseNavItems, ...roleItems, { href: '/settings', label: 'Settings', icon: Settings }];

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "hover:bg-primary/10 text-foreground/60 hover:text-foreground"
            )}
          >
            <Icon className="mr-3 h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
