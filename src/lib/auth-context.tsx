import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, tokenStore } from './api';

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'free' | 'premium';
}

interface AuthContextValue {
  user: User | null;
  ready: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  ready: false,
  refresh: async () => {},
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
      setUser(res.user as User);
    } catch {
      tokenStore.clear();
    } finally {
      setReady(true);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <AuthContext.Provider value={{ user, ready, refresh: load }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
