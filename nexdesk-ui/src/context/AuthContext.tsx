import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

/* ── Types ──────────────────────────────────────────────────── */
export type UserRole = 'admin' | 'employee';

export interface AuthUser {
  email: string;
  role: UserRole;
  access_token: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

/* ── Context ────────────────────────────────────────────────── */
const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'nexdesk_auth';

function loadFromStorage(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

/* ── Provider ───────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadFromStorage);

  const login = useCallback((incoming: AuthUser) => {
    setUser(incoming);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(incoming));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* ── Hook ───────────────────────────────────────────────────── */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
