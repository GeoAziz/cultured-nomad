
"use client";

import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminHeader from '@/components/admin/admin-header';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Starfield from '@/components/landing/starfield';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [pathname, setPathname] = useState('');

  useEffect(() => {
    setIsMounted(true);
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (loading) return; // Wait for auth state to be determined

      const isAuthPage = pathname === '/admin/login' || pathname === '/admin';

      if (!user && !isAuthPage) {
        // If not logged in and not on an auth page, redirect to admin login
        router.push('/admin/login');
      } else if (user) {
        if (user.role !== 'admin') {
          // If logged in but not an admin, redirect to the main dashboard
          router.push('/dashboard');
        } else if (isAuthPage) {
          // If logged in as admin and on an auth page, redirect to admin dashboard
          router.push('/admin/dashboard');
        }
      }
    }
  }, [user, loading, router, isMounted, pathname]);

  // Special case for login/splash pages to avoid layout shift while checking auth
  if (pathname === '/admin/login' || pathname === '/admin') {
    return <>{children}</>;
  }
  
  // Show a loading screen while we verify the user's session and role
  if (loading || !user || user.role !== 'admin' || !isMounted) {
     return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Starfield />
        <Loader2 className="w-12 h-12 animate-spin text-primary z-10" />
      </div>
    );
  }

  // If everything checks out, render the admin layout
  return (
    <div className="flex min-h-screen bg-black text-slate-200">
      <Starfield />
      <AdminSidebar />
      <div className="flex-1 flex flex-col md:pl-64 z-10">
        <AdminHeader />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {children}
        </main>
      </div>
    </div>
  );
}
