export type Role = 'MENTOR' | 'SEEKER' | 'TECHIE' | 'MEMBER' | 'ADMIN';

export interface User {
  uid: string;
  email: string;
  role: Role;
  displayName?: string;
  photoURL?: string;
}

export interface AuthContextType {
  user: User | null;
  role: Role | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, role: Role) => Promise<void>;
}
