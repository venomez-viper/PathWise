import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, tokenStore } from './api';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'free' | 'premium';
  hasPassword?: boolean;
}

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  refresh: () => Promise<void>;
  login: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  ready: false,
  refresh: async () => {},
  login: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  const load = async () => {
    if (!tokenStore.get()) {
      setReady(true);
      return;
    }
    try {
      const res = await auth.me();
      setUser({ ...(res.user as User), hasPassword: res.hasPassword });
    } catch (err) {
      // Only clear token on auth errors, NOT on network failures (cold starts)
      if (!(err instanceof TypeError)) {
        tokenStore.clear();
      }
    } finally {
      setReady(true);
    }
  };

  useEffect(() => { load(); }, []);

  const login = (userData: User) => {
    setUser(userData);
    setReady(true);
  };

  return (
    <AuthContext.Provider value={{ user, ready, refresh: load, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
