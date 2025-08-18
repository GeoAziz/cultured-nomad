
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Calendar,
  HeartHandshake,
  BookOpen,
  Sparkles,
  CircleUserRound,
  Settings,
  Menu,
  X,
  Bot,
  LogOut,
} from 'lucide-react';
import Logo from '@/components/shared/logo';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

// Import navigation hook and types
import { useNavigation } from '@/hooks/use-navigation';
import { NavigationItem } from '@/config/navigation';

const iconMap: Record<string, any> = {
  'Dashboard': LayoutDashboard,
  'Connect': MessageSquare,
  'Events': Calendar,
  'Stories': BookOpen,
  'Wellness': Sparkles,
  'Mentorship': HeartHandshake,
  'Directory': Users,
  'Members': Users,
  'Settings': Settings,
  'Analytics': LayoutDashboard,
  'Users': Users,
};

const bottomNavItems = [
  { href: '/profile', label: 'My Profile', icon: CircleUserRound },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export default function MainSidebar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
        title: "You've been logged out.",
        description: "See you next time, Nomad!",
    })
  }

  // Get the current user's role, defaulting to 'member' if not set
  const userRole = user?.role || 'member';
  console.log('[MainSidebar] User role:', userRole); // Debug log

  const navigation = useNavigation();
  
  const sidebarContent = (
    <>
    <div className="p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="h-10 w-auto" />
        </Link>
    </div>
    <Separator className="bg-primary/20" />
    <nav className="flex-1 px-4 py-4 space-y-2">
      {navigation.map((item: NavigationItem) => {
        const Icon = iconMap[item.name] || Settings;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-primary/10 text-primary text-glow'
                : 'text-foreground/70 hover:bg-primary/5 hover:text-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
    <div className="px-4 py-4 space-y-2">
       <Button variant="ghost" className="w-full justify-start gap-3 px-4 py-3 text-foreground/70 hover:bg-accent/10 hover:text-accent">
        <Bot className="h-5 w-5" />
        <span>AI Assistant</span>
      </Button>
      <Separator className="bg-primary/20" />
      {bottomNavItems.map((item) => (
         <Link
         key={item.href}
         href={item.href}
         onClick={() => setMobileMenuOpen(false)}
         className={cn(
           'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
           pathname.startsWith(item.href)
             ? 'bg-primary/10 text-primary text-glow'
             : 'text-foreground/70 hover:bg-primary/5 hover:text-foreground'
         )}
       >
         <item.icon className="h-5 w-5" />
         <span>{item.label}</span>
       </Link>
      ))}
       <button
            onClick={handleLogout}
            className={cn(
            'flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-red-400/70 hover:bg-red-500/10 hover:text-red-400'
            )}
        >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
        </button>
    </div>
    </>
  );

  return (
    <>
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="glass-card !bg-card/70"
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>
      
      <AnimatePresence>
        {mobileMenuOpen && (
           <motion.div
           initial={{ x: '-100%' }}
           animate={{ x: 0 }}
           exit={{ x: '-100%' }}
           transition={{ type: 'spring', stiffness: 300, damping: 30 }}
           className="fixed inset-y-0 left-0 z-40 w-64 md:hidden flex flex-col glass-card !bg-background/95 border-r border-primary/20"
         >
            {sidebarContent}
         </motion.div>
        )}
      </AnimatePresence>

      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col glass-card border-r border-primary/20">
        <div className="flex min-h-0 flex-1 flex-col">{sidebarContent}</div>
      </aside>
    </>
  );
}
