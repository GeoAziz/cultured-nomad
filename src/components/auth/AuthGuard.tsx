"use client";

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export function AuthGuard({ 
  children,
  requiredRole
}: { 
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (
      !loading &&
      requiredRole &&
      user?.role?.toUpperCase() !== requiredRole?.toUpperCase()
    ) {
      router.push('/dashboard');
    }
  }, [user, loading, router, requiredRole]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (requiredRole && user.role?.toUpperCase() !== requiredRole?.toUpperCase()) {
    return null;
  }

  return <>{children}</>;
}
