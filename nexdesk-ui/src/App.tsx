import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { RequireAuth } from '@/components/router/RequireAuth';

/* Layouts */
import { RootLayout } from '@/layouts/RootLayout';
import { AuthLayout } from '@/layouts/AuthLayout';

/* Pages */
import HomePage              from '@/pages/HomePage';
import BrowsePage            from '@/pages/BrowsePage';
import SpaceDetailPage       from '@/pages/SpaceDetailPage';
import LoginPage             from '@/pages/LoginPage';
import SignupPage            from '@/pages/SignupPage';
import DashboardPage         from '@/pages/DashboardPage';
import DashboardBookingsPage from '@/pages/DashboardBookingsPage';
import DashboardProfilePage  from '@/pages/DashboardProfilePage';
import AdminPage             from '@/pages/AdminPage';
import NotFoundPage          from '@/pages/NotFoundPage';
import ComponentsDemo        from '@/pages/ComponentsDemo';  // moved to /demo
import HowItWorksPage        from '@/pages/HowItWorksPage';
import PricingPage           from '@/pages/PricingPage';
import CitiesPage            from '@/pages/CitiesPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Auth routes (no NavBar/Footer) ────────────── */}
          <Route element={<AuthLayout />}>
            <Route path="/login"  element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Route>

          {/* ── Dashboard App Shell (no marketing NavBar/Footer) ── */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          >
            <Route path="bookings" element={<DashboardBookingsPage />} />
            <Route path="profile"  element={<DashboardProfilePage />} />
          </Route>

          {/* ── Main app routes (NavBar + Footer) ─────────── */}
          <Route element={<RootLayout />}>
            {/* Public */}
            <Route index             element={<HomePage />} />
            <Route path="/browse"    element={<BrowsePage />} />
            <Route path="/space/:id" element={<SpaceDetailPage />} />
            <Route path="/how-it-works" element={<HowItWorksPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/cities" element={<CitiesPage />} />

            {/* Authenticated — admin only */}
            <Route
              path="/admin"
              element={
                <RequireAuth role="admin">
                  <AdminPage />
                </RequireAuth>
              }
            />

            {/* Component gallery — moved from / */}
            <Route path="/demo" element={<ComponentsDemo />} />

            {/* 404 catch-all */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
