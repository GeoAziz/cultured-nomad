"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Users,
  ShieldCheck,
  CreditCard,
  MessageSquareWarning,
  Settings,
  Bot,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Logo from '../shared/logo';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/services', label: 'Service Listings', icon: ShieldCheck },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/feedback', label: 'Feedback & Reports', icon: MessageSquareWarning },
  { href: '/admin/settings', label: 'System Settings', icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col border-r border-slate-800 bg-black">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex h-16 items-center justify-center border-b border-slate-800 px-4">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-primary" />
            <h1 className="font-headline text-xl font-bold text-glow">Admin Core</h1>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                pathname.startsWith(item.href)
                  ? 'bg-primary/20 text-primary text-glow'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
