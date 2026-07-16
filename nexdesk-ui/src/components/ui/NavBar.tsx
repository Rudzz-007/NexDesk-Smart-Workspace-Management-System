import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Building2 } from 'lucide-react';
import { Button } from './Button';

interface NavBarProps {
  isLoggedIn?: boolean;
  userRole?: 'admin' | 'employee' | null;
  userEmail?: string;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
  onDashboard?: () => void;
  onAdmin?: () => void;
}

const NAV_LINKS = [
  { label: 'Hot Desks', href: '/#desks' },
  { label: 'How it works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Cities', href: '/cities' },
];

export function NavBar({
  isLoggedIn = false,
  userRole = null,
  userEmail = '',
  onLogin,
  onSignup,
  onLogout,
  onDashboard,
  onAdmin,
}: NavBarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();

  const getLinkUrl = (href: string) => {
    if (href.startsWith('/#') && location.pathname === '/') {
      return href.substring(1); // just return the hash part e.g. '#desks'
    }
    return href;
  };

  const isLinkActive = (href: string) => {
    if (href.startsWith('/') && !href.includes('#')) {
      return location.pathname === href;
    }
    if (href === '/#desks') {
      return location.pathname === '/' && (location.hash === '#desks' || !location.hash);
    }
    return location.pathname === '/' && location.hash === href.substring(1);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#e2e8f0] shadow-xs">
      <nav className="container-nd flex items-center justify-between h-16" aria-label="Main navigation">
        {/* ── Logo ──────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0 group" aria-label="NexDesk home">
          <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center shadow-sm group-hover:bg-[#2563eb] transition-colors duration-150">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-[#0f172a] tracking-tight">
            Nex<span className="text-[#3b82f6]">Desk</span>
          </span>
        </Link>

        {/* ── Desktop nav links ────────────────────────────── */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {NAV_LINKS.map((link) => {
            const isActive = isLinkActive(link.href);
            const isSpaRoute = link.href.startsWith('/') && !link.href.includes('#');
            const classes = [
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
              isActive
                ? 'text-[#3b82f6] bg-[#eff6ff]'
                : 'text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc]',
            ].join(' ');

            return (
              <li key={link.label}>
                {isSpaRoute ? (
                  <Link to={link.href} className={classes}>
                    {link.label}
                  </Link>
                ) : (
                  <a href={getLinkUrl(link.href)} className={classes}>
                    {link.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>

        {/* ── Desktop CTA ───────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          {isLoggedIn ? (
            /* Logged-in user menu */
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                id="user-menu-trigger"
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#e2e8f0] text-sm font-medium text-[#334155] hover:bg-[#f8fafc] transition-colors duration-150"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
              >
                <div className="w-7 h-7 rounded-full bg-[#3b82f6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[120px] truncate">{userEmail.split('@')[0]}</span>
                <ChevronDown size={14} className="text-[#94a3b8]" />
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-1 w-48 bg-white rounded-xl border border-[#e2e8f0] shadow-lg overflow-hidden py-1"
                >
                  <button
                    role="menuitem"
                    onClick={() => { onDashboard?.(); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#334155] hover:bg-[#f8fafc]"
                  >
                    My Dashboard
                  </button>
                  {userRole === 'admin' && (
                    <button
                      role="menuitem"
                      onClick={() => { onAdmin?.(); setUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-sm text-[#334155] hover:bg-[#f8fafc]"
                    >
                      Admin Panel
                    </button>
                  )}
                  <hr className="border-[#f1f5f9] my-1" />
                  <button
                    role="menuitem"
                    onClick={() => { onLogout?.(); setUserMenuOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[#dc2626] hover:bg-[#fef2f2]"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onLogin}>
                Log in
              </Button>
              <Button variant="primary" size="sm" onClick={onSignup}>
                Get started
              </Button>
            </>
          )}
        </div>

        {/* ── Mobile hamburger ─────────────────────────────── */}
        <button
          className="md:hidden p-2 rounded-lg text-[#475569] hover:bg-[#f8fafc] transition-colors"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* ── Mobile drawer ────────────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#e2e8f0] bg-white px-4 pb-4 pt-2">
          <ul className="flex flex-col gap-1" role="list">
            {NAV_LINKS.map((link) => {
              const isSpaRoute = link.href.startsWith('/') && !link.href.includes('#');
              const classes = "block px-3 py-2.5 rounded-lg text-sm font-medium text-[#475569] hover:text-[#0f172a] hover:bg-[#f8fafc]";

              return (
                <li key={link.label}>
                  {isSpaRoute ? (
                    <Link
                      to={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={classes}
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={getLinkUrl(link.href)}
                      onClick={() => setMobileOpen(false)}
                      className={classes}
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-[#f1f5f9]">
            {isLoggedIn ? (
              <>
                <Button variant="secondary" size="md" fullWidth onClick={onDashboard}>My Dashboard</Button>
                <Button variant="ghost" size="md" fullWidth onClick={onLogout}>Sign out</Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="md" fullWidth onClick={onLogin}>Log in</Button>
                <Button variant="primary" size="md" fullWidth onClick={onSignup}>Get started</Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
