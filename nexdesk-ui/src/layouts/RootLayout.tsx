import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { NavBar } from '@/components/ui/NavBar';
import { Footer } from '@/components/ui/Footer';
import { useAuth } from '@/context/AuthContext';
import ChatAssistant from '@/components/ui/ChatAssistant';

/**
 * RootLayout — wraps every page EXCEPT /login and /signup.
 * Renders: sticky NavBar → <Outlet /> → Footer
 * NavBar is wired to AuthContext; no prop-drilling needed in child pages.
 */
export function RootLayout() {
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar
        isLoggedIn={isLoggedIn}
        userRole={user?.role ?? null}
        userEmail={user?.email ?? ''}
        onLogin={() => navigate('/login')}
        onSignup={() => navigate('/signup')}
        onLogout={() => { logout(); navigate('/'); }}
        onDashboard={() => navigate('/dashboard')}
        onAdmin={() => navigate('/admin')}
      />

      {/* Page content fills available space, pushing Footer to bottom */}
      <main key={location.pathname} className="flex-1 page-transition">
        <Outlet />
      </main>

      <Footer />
      <ChatAssistant />
    </div>
  );
}
