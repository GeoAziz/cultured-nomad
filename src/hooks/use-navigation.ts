import { useAuth } from './use-auth';
import { navigationConfig, NavigationItem } from '@/config/navigation';
import { Role } from '@/types/auth';

export function useNavigation(): NavigationItem[] {
  const { user } = useAuth();

  if (!user?.role) {
    return [];
  }

  const role = user.role.toUpperCase() as Role;
  return navigationConfig[role] || [];
}

export function useAuthorizedRoute(path: string): boolean {
  const { user } = useAuth();
  
  if (!user?.role) {
    return false;
  }

  const role = user.role.toUpperCase() as Role;
  const navigation = navigationConfig[role];
  return navigation.some((item: NavigationItem) => {
    if (item.href === path) return true;
    if (item.children) {
      return item.children.some((child: NavigationItem) => child.href === path);
    }
    return false;
  });
}
