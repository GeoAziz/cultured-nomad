
"use client";

import MainSidebar from '@/components/shared/main-sidebar';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import ToasterClient from '@/components/ui/toaster-client';

function ProtectedRouteLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only perform redirects once the auth state is fully loaded
    if (!loading) {
      if (!user) {
        // If not logged in and not on a public page (though none should exist here), redirect
        router.push('/login');
      }
    }
  }, [user, loading, router, pathname]);

  // While loading, show a spinner to prevent rendering children, which might have their own auth checks
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If loading is complete and still no user, it means the redirect is in progress.
  // Returning null prevents a flash of the child layout.
  if (!user) {
    return null;
  }
  
  // If loading is complete and we have a user, render the protected layout
  return (
    <>
      <div className="flex min-h-screen bg-background">
        <MainSidebar />
        <main className="flex-1 md:pl-64">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
      <ToasterClient />
    </>
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
