
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
    setPathname(window.location.pathname);
  }, []);

  useEffect(() => {
    if (!loading && !user && isMounted && pathname !== '/admin/login' && pathname !== '/admin') {
      router.push('/admin/login');
    }
  }, [user, loading, router, isMounted, pathname]);

  // Special case for login/splash pages to avoid layout shift
  if (pathname === '/admin/login' || pathname === '/admin') {
    return <>{children}</>;
  }
  
  if (loading || !user || !isMounted) {
     return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Starfield />
        <Loader2 className="w-12 h-12 animate-spin text-primary z-10" />
      </div>
    );
  }

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
