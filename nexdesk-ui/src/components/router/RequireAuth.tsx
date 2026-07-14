import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { ReactNode } from 'react';

interface RequireAuthProps {
  children: ReactNode;
  /** If provided, user must ALSO have this role or be redirected */
  role?: 'admin' | 'employee';
  /** Where to redirect unauthenticated users (default: /login) */
  redirectTo?: string;
}

/**
 * Wraps any route that needs authentication (or a specific role).
 * Preserves the original path in `state.from` so login can redirect back.
 */
export function RequireAuth({ children, role, redirectTo = '/login' }: RequireAuthProps) {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();

  // Not logged in at all → go to login
  if (!isLoggedIn) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Logged in but wrong role (e.g. employee hitting /admin) → go to dashboard
  if (role && user?.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
