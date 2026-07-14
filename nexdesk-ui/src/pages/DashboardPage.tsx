import React from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, User, LogOut,
  Building2, ChevronRight, ArrowLeft, ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';
import DashboardOverview from './DashboardOverview';

const NAV_ITEMS = [
  { to: '/dashboard',          label: 'Overview',    icon: <LayoutDashboard size={18} />, end: true  },
  { to: '/dashboard/bookings', label: 'My Bookings', icon: <CalendarDays size={18} />,   end: false },
  { to: '/dashboard/profile',  label: 'Profile',     icon: <User size={18} />,           end: false },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isExactOverview = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userName = user?.email ? user.email.split('@')[0] : 'Member';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* ── Top Shell Header (No marketing NavBar) ── */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#e2e8f0] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-[#3b82f6] text-white flex items-center justify-center shadow-xs group-hover:bg-[#2563eb] transition-colors">
                <Building2 size={19} />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#0f172a]">
                Nex<span className="text-[#3b82f6]">Desk</span>
              </span>
            </Link>

            <span className="hidden sm:inline-block h-4 w-px bg-[#e2e8f0]" />

            <Link
              to="/browse"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748b] hover:text-[#0f172a] transition-colors"
            >
              <ArrowLeft size={13} />
              Browse Desks
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f1f5f9] text-xs font-medium text-[#334155]">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              <span>{user?.email || 'user@nexdesk.com'}</span>
            </div>

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-xl bg-[#eff6ff] text-[#3b82f6] text-xs font-semibold hover:bg-[#dbeafe] transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck size={14} />
                Admin
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e2e8f0] bg-white text-xs font-semibold text-[#64748b] hover:bg-[#fef2f2] hover:text-[#dc2626] hover:border-[#fecaca] transition-colors cursor-pointer"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Main App Shell Body (Left Sidebar + Main Content) ── */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row pb-20 md:pb-12">
        {/* Desktop Left Sidebar Nav */}
        <aside
          aria-label="Dashboard navigation"
          className="hidden md:flex md:w-64 flex-shrink-0 flex-col justify-between border-r border-[#e2e8f0] bg-white px-5 py-8"
        >
          <div className="space-y-6">
            <div className="px-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
                Account Portal
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center font-bold uppercase">
                  {userName.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#0f172a] truncate capitalize">
                    {userName}
                  </p>
                  <Badge
                    variant={user?.role === 'admin' ? 'pending' : 'available'}
                    className="mt-0.5"
                  >
                    {user?.role === 'admin' ? 'Admin' : 'Employee'}
                  </Badge>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => [
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                    isActive
                      ? 'bg-[#eff6ff] text-[#3b82f6] shadow-2xs'
                      : 'text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a]',
                  ].join(' ')}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  <ChevronRight
                    size={14}
                    className="ml-auto opacity-40 group-hover:opacity-100"
                  />
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="px-3 pt-6 border-t border-[#f1f5f9]">
            <Link
              to="/browse"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#f8fafc] hover:bg-[#f1f5f9] text-xs font-semibold text-[#475569] transition-colors"
            >
              <span>Book another desk</span>
              <span className="text-[#3b82f6]">→</span>
            </Link>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-8">
          {isExactOverview ? <DashboardOverview /> : <Outlet />}
        </main>
      </div>

      {/* ── Mobile Bottom Tab Bar (Collapses sidebar on mobile) ── */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e2e8f0] px-2 py-1.5 flex items-center justify-around shadow-lg"
      >
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => [
              'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors',
              isActive
                ? 'text-[#3b82f6]'
                : 'text-[#64748b] hover:text-[#0f172a]',
            ].join(' ')}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
