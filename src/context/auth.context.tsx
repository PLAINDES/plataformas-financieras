import { createContext, type ReactNode } from 'react';
import type { User } from '../types';
import { useAuth } from '../hooks/useAuth';

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAdmin: () => boolean;
  isAuthenticated: boolean;
  login: (data: any) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  getToken: () => string | null;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <>
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
    </>
  );
}
