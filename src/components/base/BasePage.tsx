import { Role } from '@/types/auth';
import { useAuth } from '@/hooks/use-auth';
import PageHeader from '@/components/shared/page-header';

interface BasePageProps {
  children: React.ReactNode;
  role?: Role;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function BasePage({ 
  children, 
  role, 
  title,
  description,
  actions 
}: BasePageProps) {
  const { user } = useAuth();

  // Only render if no role is specified (shared) or if role matches exactly
  if (role && (!user?.role || user.role.toUpperCase() !== role.toUpperCase())) {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title={title} 
        description={description}
        actions={actions}
      />
      <div className="container mx-auto">
        {children}
      </div>
    </div>
  );
}
