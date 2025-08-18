
"use client";

import MainSidebar from '@/components/shared/main-sidebar';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

function ProtectedRouteLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('[ProtectedRouteLayout] Running effect. Loading:', loading, 'User:', user ? user.uid : 'null', 'Path:', pathname);
    if (!loading && !user) {
      console.log('[ProtectedRouteLayout] No user and not loading, redirecting to /login');
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    console.log('[ProtectedRouteLayout] Auth is loading, showing spinner.');
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    console.log('[ProtectedRouteLayout] No user, rendering null (should be redirected).');
    return null;
  }
  
  console.log('[ProtectedRouteLayout] User is authenticated, rendering layout.');
  return (
      <div className="flex min-h-screen bg-background">
        <MainSidebar />
        <main className="flex-1 md:pl-64">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRouteLayoutContent>
      {children}
    </ProtectedRouteLayoutContent>
  );
}
