import { Role } from '@/types/auth';
import { useAuth } from '@/hooks/use-auth';
import PageHeader from '@/components/shared/page-header';

interface BaseDashboardProps {
  children: React.ReactNode;
  role?: Role;
  title?: string;
  description?: string;
}

export function BaseDashboard({ 
  children, 
  role, 
  title = 'Dashboard',
  description = 'Welcome to your personalized dashboard'
}: BaseDashboardProps) {
  const { user } = useAuth();

  // Only render if no role is specified (shared) or if role matches
  // Only render if no role is specified (shared) or if role matches exactly
  if (role && (!user?.role || user.role.toUpperCase() !== role.toUpperCase())) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}
