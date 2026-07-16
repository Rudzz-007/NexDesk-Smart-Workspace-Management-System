import { Link } from 'react-router-dom';
import { Building2, MessageCircle, Briefcase, GitFork, Mail, Phone } from 'lucide-react';

const FOOTER_LINKS = {
  Company: [
    { label: 'About Us',    href: '#' },
    { label: 'Careers',     href: '#' },
    { label: 'Blog',        href: '#' },
    { label: 'Press',       href: '#' },
  ],
  Cities: [
    { label: 'All Cities',  href: '/cities' },
    { label: 'Bangalore',   href: '/browse?city=Bangalore' },
    { label: 'Mumbai',      href: '/browse?city=Mumbai' },
    { label: 'Delhi NCR',   href: '/browse?city=Delhi%20NCR' },
    { label: 'Hyderabad',   href: '/browse?city=Hyderabad' },
    { label: 'Pune',        href: '/browse?city=Pune' },
    { label: 'Chennai',     href: '/browse?city=Chennai' },
  ],
  Resources: [
    { label: 'How it Works',   href: '/how-it-works' },
    { label: 'Pricing Guide',  href: '/pricing' },
    { label: 'API Docs',       href: '#' },
    // Future: { label: 'Meeting Room Guide', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Use',   href: '#' },
    { label: 'Cookie Policy',  href: '#' },
    { label: 'Refund Policy',  href: '#' },
  ],
};

const SOCIAL = [
  { icon: <MessageCircle size={18} />, href: '#', label: 'Twitter'  },
  { icon: <Briefcase size={18} />,    href: '#', label: 'LinkedIn' },
  { icon: <GitFork size={18} />,      href: '#', label: 'GitHub'   },
];

export function Footer() {
  return (
    <footer className="bg-[#f8fafc] border-t border-[#e2e8f0] pt-14 pb-8" aria-label="Footer">
      <div className="container-nd">
        {/* ── Top grid: brand + link columns ─────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-10 mb-12">
          {/* Brand column — spans 2 on lg */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 w-fit" aria-label="NexDesk home">
              <div className="w-8 h-8 rounded-lg bg-[#3b82f6] flex items-center justify-center shadow-sm">
                <Building2 size={18} className="text-white" />
              </div>
              <span className="text-xl font-bold text-[#0f172a]">
                Nex<span className="text-[#3b82f6]">Desk</span>
              </span>
            </a>
            <p className="text-sm text-[#64748b] leading-relaxed max-w-xs">
              India's smart workspace booking platform — find, book, and manage hot desks across top
              coworking spaces in your city.
            </p>
            {/* Contact */}
            <div className="flex flex-col gap-2">
              <a href="mailto:hello@nexdesk.in" className="flex items-center gap-2 text-sm text-[#475569] hover:text-[#3b82f6] transition-colors">
                <Mail size={14} className="text-[#94a3b8]" />
                hello@nexdesk.in
              </a>
              <a href="tel:+918000000000" className="flex items-center gap-2 text-sm text-[#475569] hover:text-[#3b82f6] transition-colors">
                <Phone size={14} className="text-[#94a3b8]" />
                +91 80000 00000
              </a>
            </div>
            {/* Social icons */}
            <div className="flex items-center gap-2 mt-1">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-[#64748b] border border-[#e2e8f0] bg-white hover:border-[#3b82f6] hover:text-[#3b82f6] transition-colors duration-150"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group} className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-[#0f172a] uppercase tracking-wider">
                {group}
              </h4>
              <ul className="flex flex-col gap-2" role="list">
                {links.map((link) => {
                  const isInternal = link.href.startsWith('/');
                  const classes = "text-sm text-[#64748b] hover:text-[#3b82f6] transition-colors duration-150";
                  return (
                    <li key={link.label}>
                      {isInternal ? (
                        <Link to={link.href} className={classes}>
                          {link.label}
                        </Link>
                      ) : (
                        <a href={link.href} className={classes}>
                          {link.label}
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* ── Bottom bar ────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-[#e2e8f0]">
          <p className="text-xs text-[#94a3b8]">
            &copy; {new Date().getFullYear()} NexDesk Technologies Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-1">
            <span className="text-xs text-[#94a3b8]">Made with</span>
            <span className="text-xs text-[#ef4444]">♥</span>
            <span className="text-xs text-[#94a3b8]">in India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
