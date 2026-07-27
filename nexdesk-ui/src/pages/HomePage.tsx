import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, MapPin, Calendar, ShieldCheck, Zap, Building2,
  BadgeCheck, ArrowRight, QrCode, Star, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SpaceCard, type DeskData } from '@/components/ui/SpaceCard';
import { Badge } from '@/components/ui/Badge';
import { CityLandmarkIcon } from '@/components/ui/CityLandmarkIcon';
import { useAuth } from '@/context/AuthContext';

/* ─── pure-data constants (no JSX at module level) ───────────────── */
const CITIES = [
  'Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune',
  'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi',
  'Chandigarh', 'Indore',
];

const TRUST_STATS = [
  { key: 'desks',    value: '50+',  label: 'Verified Desks' },
  { key: 'cities',   value: '10+',  label: 'Cities' },
  { key: 'pricing',  value: '100%', label: 'Transparent Pricing' },
  { key: 'booking',  value: '<60s', label: 'Instant Booking' },
];

const HOW_STEPS = [
  { key: 'search', title: 'Search',           desc: 'Pick your city and date. Browse real-time desk availability across premium coworking spaces.' },
  { key: 'book',   title: 'Book',             desc: 'Confirm with ML-powered dynamic pricing. Get a booking confirmation email instantly.' },
  { key: 'qr',     title: 'Check in with QR', desc: 'Generate your secure QR token in-app. Scan at the kiosk — unverified slots auto-release in 30 min.' },
];

const TESTIMONIALS = [
  {
    quote: 'NexDesk cut our team\'s office costs by 40%. The QR check-in is genius — no more ghost bookings.',
    name: 'Priya Sharma', company: 'Razorpay', initials: 'PS', color: '#3b82f6',
  },
  {
    quote: 'I love that I can book a desk in Pune on Monday and Bangalore by Friday — all from one dashboard.',
    name: 'Arjun Mehta', company: 'Zepto', initials: 'AM', color: '#8b5cf6',
  },
  {
    quote: 'The auto-release watchdog is real! My colleague forgot to check in and the desk was freed for me within minutes.',
    name: 'Sneha Rao', company: 'Swiggy', initials: 'SR', color: '#059669',
  },
];

/* ─── desk image pool (Unsplash statics, no API key needed) ─────── */
const DESK_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1562664377-709f2c337eb2?w=600&auto=format&fit=crop',
];

/* ═══════════════════════════════════════════════════════════════════
   HomePage
══════════════════════════════════════════════════════════════════════ */
export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [city, setCity]     = useState('');
  const [date, setDate]     = useState('');
  const [desks, setDesks]   = useState<DeskData[]>([]);
  const [loading, setLoading] = useState(true);

  /* fetch featured desks */
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/desks/?limit=6`)
      .then(r => r.json())
      .then(data => {
        const list: DeskData[] = Array.isArray(data) ? data : (data.desks ?? []);
        setDesks(list);
      })
      .catch(() => setDesks([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city) params.set('city', city);
    if (date) params.set('date', date);
    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="w-full">

      {/* ══════════════════════════════════════════════════════════
          1 · HERO
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 60%, #f0f9ff 100%)' }}
      >
        {/* faint grid overlay */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg,#3b82f6 0,#3b82f6 1px,transparent 1px,transparent 48px),' +
              'repeating-linear-gradient(90deg,#3b82f6 0,#3b82f6 1px,transparent 1px,transparent 48px)',
          }}
        />

        <div className="container-nd relative py-20 lg:py-28">
          <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">

            {/* left copy */}
            <div className="flex-1 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#dbeafe] border border-[#bfdbfe] text-sm text-[#1d4ed8] font-medium mb-6">
                <span className="w-2 h-2 rounded-full bg-[#3b82f6] animate-pulse" />
                Smartest Workspace Platform
              </div>

              <h1 className="text-5xl lg:text-[3.5rem] font-bold text-[#0f172a] leading-[1.1] mb-5">
                Book desks and<br />
                <span className="text-[#3b82f6]">workspaces —</span><br />
                on demand.
              </h1>

              <p className="text-lg text-[#64748b] leading-relaxed mb-10 max-w-md">
                Flexible hot-desk bookings across 50+ verified coworking spaces in 10+ cities.
                Dynamic pricing, instant confirmation, QR check-in.
              </p>

              {/* ── search bar ── */}
              <div className="flex flex-col sm:flex-row gap-2 bg-white rounded-xl shadow-sm border border-[#e2e8f0] p-1.5">
                {/* city */}
                <div className="flex items-center gap-2 flex-1 px-3 py-2 border-b sm:border-b-0 sm:border-r border-[#e2e8f0]">
                  <MapPin size={18} className="text-[#3b82f6] flex-shrink-0" />
                  <select
                    id="hero-city"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-transparent text-sm text-[#0f172a] font-medium outline-none cursor-pointer appearance-none"
                  >
                    <option value="">Select city…</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* date */}
                <div className="flex items-center gap-2 flex-1 px-3 py-2">
                  <Calendar size={18} className="text-[#3b82f6] flex-shrink-0" />
                  <input
                    id="hero-date"
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-transparent text-sm text-[#0f172a] font-medium outline-none cursor-pointer"
                  />
                </div>
                {/* button */}
                <div className="flex-shrink-0">
                  <Button
                    id="hero-search-btn"
                    size="lg"
                    leftIcon={<Search size={18} />}
                    onClick={handleSearch}
                    className="w-full sm:w-auto h-full"
                  >
                    Search
                  </Button>
                </div>
              </div>
            </div>

            {/* right image */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                {/* decorative blob */}
                <div
                  aria-hidden="true"
                  className="absolute -top-8 -right-8 w-72 h-72 rounded-full opacity-20 blur-3xl"
                  style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }}
                />
                <img
                  src="/hero-workspace.png"
                  alt="Modern NexDesk coworking space"
                  className="relative rounded-2xl shadow-xl w-full object-cover"
                  style={{ maxHeight: '420px' }}
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop';
                  }}
                />
                {/* floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg border border-[#e2e8f0] px-4 py-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#dcfce7] flex items-center justify-center">
                    <ShieldCheck size={18} className="text-[#16a34a]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b]">All desks</p>
                    <p className="text-sm font-semibold text-[#0f172a]">Verified & Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          2 · TRUST STRIP
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white border-y border-[#e2e8f0]">
        <div className="container-nd py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_STATS.map(s => {
              const iconMap: Record<string, React.ReactNode> = {
                desks:   <Building2 size={22} className="text-[#3b82f6]" />,
                cities:  <MapPin    size={22} className="text-[#3b82f6]" />,
                pricing: <BadgeCheck size={22} className="text-[#3b82f6]" />,
                booking: <Zap       size={22} className="text-[#3b82f6]" />,
              };
              return (
                <div key={s.label} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#eff6ff] flex items-center justify-center flex-shrink-0">
                    {iconMap[s.key]}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#0f172a] leading-tight">{s.value}</p>
                    <p className="text-sm text-[#64748b]">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          3 · FEATURED DESKS
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#f8fafc] py-16">
        <div className="container-nd">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-sm font-medium text-[#3b82f6] mb-1">Hand-picked for you</p>
              <h2 className="text-3xl font-bold text-[#0f172a]">Featured Desks</h2>
            </div>
            <Button
              id="see-all-desks-btn"
              variant="ghost"
              size="sm"
              rightIcon={<ChevronRight size={14} />}
              onClick={() => navigate('/browse')}
            >
              See all
            </Button>
          </div>

          {loading ? (
            /* skeleton row */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl bg-[#e2e8f0] animate-pulse h-64" />
              ))}
            </div>
          ) : desks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fade-in">
              {desks.map((desk, i) => (
                <SpaceCard
                  key={desk.id}
                  desk={desk}
                  image={DESK_IMAGES[i % DESK_IMAGES.length]}
                  rating={+(4.2 + (i % 4) * 0.2).toFixed(1)}
                  reviewCount={18 + i * 7}
                  onBook={() => navigate(`/space/${desk.id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-white rounded-2xl border border-[#e2e8f0] shadow-sm">
              <Building2 size={32} className="mx-auto text-[#94a3b8] mb-3" />
              <h3 className="text-lg font-bold text-[#0f172a] mb-2">No desks found</h3>
              <p className="text-sm text-[#64748b]">Check back later for new workspace additions.</p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          4 · HOW BOOKING WORKS
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16">
        <div className="container-nd">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#3b82f6] mb-1">Simple as 1-2-3</p>
            <h2 className="text-3xl font-bold text-[#0f172a]">How booking works</h2>
          </div>

          <div className="relative flex flex-col lg:flex-row gap-8 lg:gap-0">
            {/* connector line (desktop only) */}
            <div
              aria-hidden="true"
              className="hidden lg:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-[#dbeafe]"
            />

          {HOW_STEPS.map((step, i) => {
              const stepIconMap: Record<string, React.ReactNode> = {
                search: <Search      size={28} className="text-[#3b82f6]" />,
                book:   <ShieldCheck size={28} className="text-[#3b82f6]" />,
                qr:     <QrCode      size={28} className="text-[#3b82f6]" />,
              };
              return (
                <div key={step.key} className="flex-1 flex flex-col items-center text-center px-6 relative">
                  {i < HOW_STEPS.length - 1 && (
                    <ArrowRight size={20} className="hidden lg:block absolute right-0 top-10 text-[#93c5fd] translate-x-1/2" />
                  )}
                  <div className="relative mb-5">
                    <div className="w-20 h-20 rounded-2xl bg-[#eff6ff] border-2 border-[#dbeafe] flex items-center justify-center shadow-sm">
                      {stepIconMap[step.key]}
                    </div>
                    <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#3b82f6] text-white text-xs font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#0f172a] mb-2">{step.title}</h3>
                  <p className="text-sm text-[#64748b] leading-relaxed max-w-xs">{step.desc}</p>
                  {i === 2 && (
                    <Badge variant="verified" className="mt-3">
                      <ShieldCheck size={10} /> Auto-release watchdog active
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          5 · CITIES WE SERVE
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-[#f8fafc] py-16 border-y border-[#e2e8f0]">
        <div className="container-nd">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-[#3b82f6] mb-1">Expanding fast</p>
            <h2 className="text-3xl font-bold text-[#0f172a]">Cities we serve</h2>
            <p className="text-[#64748b] mt-2">From metros to emerging tech hubs — we've got you covered.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {CITIES.map(c => (
              <a
                key={c}
                href={`/browse?city=${encodeURIComponent(c)}`}
                onClick={e => { e.preventDefault(); navigate(`/browse?city=${encodeURIComponent(c)}`); }}
                className={[
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-xl',
                  'bg-white border border-[#e2e8f0] text-[#0f172a] text-sm font-semibold',
                  'hover:border-[#3b82f6] hover:text-[#3b82f6] hover:bg-[#eff6ff]',
                  'transition-all duration-150 shadow-sm cursor-pointer hover-lift',
                ].join(' ')}
              >
                <CityLandmarkIcon city={c} className="w-5 h-5 text-[#3b82f6]" />
                {c}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          6 · TESTIMONIALS
      ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16">
        <div className="container-nd">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[#3b82f6] mb-1">What our users say</p>
            <h2 className="text-3xl font-bold text-[#0f172a]">Loved by professionals</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(t => (
              <div
                key={t.name}
                className="bg-[#f8fafc] border border-[#e2e8f0] rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200"
              >
                {/* stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="text-[#f59e0b] fill-[#f59e0b]" />
                  ))}
                </div>
                <p className="text-[#334155] text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-[#e2e8f0]">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0f172a]">{t.name}</p>
                    <p className="text-xs text-[#94a3b8]">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          7 · FINAL CTA BAND
      ══════════════════════════════════════════════════════════ */}
      <section
        className="py-20"
        style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)' }}
      >
        <div className="container-nd text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to find your desk?
          </h2>
          <p className="text-[#bfdbfe] text-lg mb-10 max-w-md mx-auto">
            Join thousands of professionals booking smarter workspaces every day.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              id="cta-browse-btn"
              size="lg"
              className="bg-white !text-[#2563eb] hover:bg-[#eff6ff] border-white"
              leftIcon={<Search size={18} />}
              onClick={() => navigate('/browse')}
            >
              Browse Desks Now
            </Button>
            {user ? (
              <Button
                id="cta-dashboard-btn"
                size="lg"
                variant="secondary"
                className="!bg-transparent !text-white !border-white hover:!bg-white/10"
                rightIcon={<ArrowRight size={16} />}
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                id="cta-signup-btn"
                size="lg"
                variant="secondary"
                className="!bg-transparent !text-white !border-white hover:!bg-white/10"
                rightIcon={<ArrowRight size={16} />}
                onClick={() => navigate('/signup')}
              >
                Create Free Account
              </Button>
            )}
          </div>
          <p className="text-[#93c5fd] text-xs mt-6">
            No credit card required · Cancel anytime
          </p>
        </div>
      </section>

    </div>
  );
}
