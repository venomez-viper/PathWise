import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import posthog from 'posthog-js';
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
      const u = res.user as User;
      setUser(u);
      posthog.identify(u.id, { email: u.email, name: u.name, plan: u.plan });
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
    // Identify user in PostHog
    posthog.identify(userData.id, {
      email: userData.email,
      name: userData.name,
      plan: userData.plan,
    });
  };

  return (
    <AuthContext.Provider value={{ user, ready, refresh: load, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
