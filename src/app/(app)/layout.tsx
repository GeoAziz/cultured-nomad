import MainSidebar from '@/components/shared/main-sidebar';
import { AuthProvider } from '@/context/auth-context';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
