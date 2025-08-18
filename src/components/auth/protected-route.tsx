"use client";
import { useAuthorizedRoute } from '@/hooks/use-navigation';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, redirect } from 'next/navigation';

export function ProtectedRouteLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAuthorized = useAuthorizedRoute(pathname);

  if (!user) {
    redirect('/login');
  }

  if (!isAuthorized) {
    redirect('/dashboard'); // Redirect to dashboard if user doesn't have access to this route
  }

  return <>{children}</>;
}
