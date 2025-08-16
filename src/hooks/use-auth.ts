
import { useContext } from 'react';
import { AuthContext, AuthContextType, UserProfile, UserRole } from '@/context/auth-context';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Also export the types to be used in other components
export type { UserProfile, UserRole };
