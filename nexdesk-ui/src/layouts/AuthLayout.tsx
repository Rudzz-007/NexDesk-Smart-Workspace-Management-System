import { Outlet, Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

/**
 * AuthLayout — used ONLY for /login and /signup.
 * No NavBar, no Footer — just a clean centered card on a neutral background.
 * Includes a minimal logo link back to the homepage.
 */
export function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* Minimal header — just the logo, no nav */}
      <header className="flex-shrink-0 px-6 py-5">
        <Link
          to="/"
          className="inline-flex items-center gap-2 group"
          aria-label="NexDesk — back to home"
        >
          <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center shadow-sm group-hover:bg-[#2563eb] transition-colors duration-150">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold text-[#0f172a] tracking-tight">
            Nex<span className="text-[#3b82f6]">Desk</span>
          </span>
        </Link>
      </header>

      {/* Auth card area — vertically + horizontally centered */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>

      {/* Minimal footer */}
      <footer className="flex-shrink-0 text-center py-4 text-xs text-[#94a3b8]">
        &copy; {new Date().getFullYear()} NexDesk. All rights reserved.
      </footer>
    </div>
  );
}
