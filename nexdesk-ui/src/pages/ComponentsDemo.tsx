import { useState } from 'react';
import {
  Search, Mail, Lock, Eye, Calendar, Monitor,
  Check, AlertCircle, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input, Select, LocationPicker } from '@/components/ui/FormFields';
import { Badge, AmenityPillList } from '@/components/ui/Badge';
import { SpaceCard, type DeskData } from '@/components/ui/SpaceCard';
import { NavBar } from '@/components/ui/NavBar';
import { Footer } from '@/components/ui/Footer';

/* ── Sample desk data (mirrors GET /desks/ response shape exactly) ── */
const SAMPLE_DESKS: DeskData[] = [
  {
    id: 1,
    desk_id: 'DESK-A01',
    location: 'Zone A - Main Floor',
    base_price: 120,
    amenities: 'WiFi,Monitor,Power',
    is_active: 'available',
  },
  {
    id: 5,
    desk_id: 'DESK-P99',
    location: 'Zone B - Premium Wing',
    base_price: 180,
    amenities: 'WiFi,4K Monitor,Standing Desk,Power',
    is_active: 'available',
  },
  {
    id: 7,
    desk_id: 'DESK-CONF-01',
    location: 'Zone C - Collaborative Area',
    base_price: 200,
    amenities: 'WiFi,Whiteboard,Projector,Power',
    is_active: 'maintenance',
  },
];

const DESK_IMAGES = [
  '/cowork1.jpg',
  '/cowork2.jpg',
  '/cowork3.jpg',
];

/* ── Section wrapper ─────────────────────────────────────────── */
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="py-10 border-b border-[#f1f5f9] last:border-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#0f172a]">{title}</h2>
        {subtitle && <p className="text-sm text-[#64748b] mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

/* ── Color swatch ────────────────────────────────────────────── */
function Swatch({ bg, label, hex }: { bg: string; label: string; hex: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`w-full h-12 rounded-xl border border-[#e2e8f0] ${bg}`} />
      <p className="text-xs font-medium text-[#334155]">{label}</p>
      <p className="text-xs text-[#94a3b8] font-mono">{hex}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════ */
export default function ComponentsDemo() {
  const [city, setCity] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [navLoggedIn, setNavLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Live NavBar preview */}
      <NavBar
        isLoggedIn={navLoggedIn}
        userRole={navLoggedIn ? 'admin' : null}
        userEmail="rudra@nexdesk.in"
        onLogin={() => setNavLoggedIn(true)}
        onSignup={() => setNavLoggedIn(true)}
        onLogout={() => setNavLoggedIn(false)}
      />

      {/* Demo toggle */}
      <div className="bg-[#eff6ff] border-b border-[#bfdbfe] py-2">
        <div className="container-nd flex items-center gap-4 text-sm text-[#3b82f6]">
          <span className="font-semibold">Component Gallery</span>
          <span className="text-[#93c5fd]">|</span>
          <button
            onClick={() => setNavLoggedIn((v) => !v)}
            className="underline underline-offset-2 hover:text-[#1d4ed8] transition-colors"
          >
            Toggle NavBar: {navLoggedIn ? 'Logged in (admin)' : 'Logged out'}
          </button>
        </div>
      </div>

      <main className="container-nd py-12">

        {/* ── 1. Color Tokens ──────────────────────────────────── */}
        <Section title="1. Color Tokens" subtitle="Primary blue scale + status semantic colors">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Primary Blue</p>
              <div className="grid grid-cols-5 sm:grid-cols-9 gap-2">
                {[
                  ['bg-[#eff6ff]','50','#eff6ff'],
                  ['bg-[#dbeafe]','100','#dbeafe'],
                  ['bg-[#bfdbfe]','200','#bfdbfe'],
                  ['bg-[#93c5fd]','300','#93c5fd'],
                  ['bg-[#60a5fa]','400','#60a5fa'],
                  ['bg-[#3b82f6]','500','#3b82f6'],
                  ['bg-[#2563eb]','600','#2563eb'],
                  ['bg-[#1d4ed8]','700','#1d4ed8'],
                  ['bg-[#1e3a8a]','900','#1e3a8a'],
                ].map(([bg, label, hex]) => (
                  <Swatch key={label} bg={bg} label={`blue-${label}`} hex={hex} />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Status Colors</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <Swatch bg="bg-[#22c55e]"  label="success"     hex="#22c55e" />
                <Swatch bg="bg-[#f59e0b]"  label="warning"     hex="#f59e0b" />
                <Swatch bg="bg-[#ef4444]"  label="error"       hex="#ef4444" />
                <Swatch bg="bg-[#f8fafc]"  label="neutral-50"  hex="#f8fafc" />
                <Swatch bg="bg-[#e2e8f0]"  label="neutral-200" hex="#e2e8f0" />
                <Swatch bg="bg-[#0f172a]"  label="neutral-900" hex="#0f172a" />
              </div>
            </div>
          </div>
        </Section>

        {/* ── 2. Typography ─────────────────────────────────────── */}
        <Section title="2. Typography" subtitle="Inter · 8px grid · generous line-height">
          <div className="space-y-3">
            <p style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1.15, color: '#0f172a' }}>
              Hero H1 — 56px Bold
            </p>
            <p style={{ fontSize: '2.75rem', fontWeight: 700, lineHeight: 1.2, color: '#0f172a' }}>
              Hero H1 — 44px Bold
            </p>
            <p style={{ fontSize: '2rem', fontWeight: 600, lineHeight: 1.25, color: '#0f172a' }}>
              Section H2 — 32px Semibold
            </p>
            <p style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.3, color: '#334155' }}>
              Card Title — 20px Semibold
            </p>
            <p style={{ fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4, color: '#334155' }}>
              Card Title — 18px Semibold
            </p>
            <p style={{ fontSize: '1rem', fontWeight: 400, lineHeight: 1.6, color: '#475569' }}>
              Body — 16px Regular. Generous line-height for easy reading across all screen sizes.
            </p>
            <p style={{ fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.5, color: '#64748b' }}>
              Caption / Label — 14px Regular · secondary text color
            </p>
            <p style={{ fontSize: '0.75rem', fontWeight: 500, lineHeight: 1.5, color: '#94a3b8' }}>
              Micro — 12px Medium · metadata, timestamps
            </p>
          </div>
        </Section>

        {/* ── 3. Button ─────────────────────────────────────────── */}
        <Section title="3. Button" subtitle="Three variants × three sizes + states">
          <div className="space-y-6">
            {/* Variants */}
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Variants</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary"   rightIcon={<ChevronRight size={16} />}>Book Now</Button>
                <Button variant="secondary" leftIcon={<Search size={15} />}>Browse Desks</Button>
                <Button variant="ghost"     leftIcon={<Calendar size={15} />}>My Bookings</Button>
              </div>
            </div>
            {/* Sizes */}
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Sizes</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
            </div>
            {/* States */}
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">States</p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary"   loading>Processing...</Button>
                <Button variant="primary"   disabled>Disabled</Button>
                <Button variant="secondary" disabled>Disabled</Button>
                <Button variant="ghost"     disabled>Disabled</Button>
                <Button variant="primary"   fullWidth>Full width button</Button>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 4. Form Fields ────────────────────────────────────── */}
        <Section title="4. Form Fields" subtitle="Input · Select · LocationPicker — shared base style">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
            <Input
              label="Email address"
              type="email"
              placeholder="you@company.com"
              leftIcon={<Mail size={16} />}
              required
            />
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button onClick={() => setShowPassword(v => !v)} type="button" tabIndex={-1}
                  className="cursor-pointer text-[#64748b] hover:text-[#0f172a]">
                  <Eye size={16} />
                </button>
              }
              required
            />
            <Input
              label="Search"
              placeholder="Find a desk..."
              leftIcon={<Search size={16} />}
            />
            <Input
              label="Error state"
              placeholder="desk_id required"
              leftIcon={<Monitor size={16} />}
              error="Please enter a valid desk ID."
            />
            <Input
              label="Hint state"
              placeholder="Optional notes"
              hint="This will be visible only to you."
            />
            <Input
              label="Disabled"
              value="DESK-P99"
              disabled
            />
            <Select
              label="Zone"
              placeholder="Select zone..."
              options={[
                { value: 'zone-a', label: 'Zone A - Main Floor' },
                { value: 'zone-b', label: 'Zone B - Premium Wing' },
                { value: 'zone-c', label: 'Zone C - Collaborative' },
              ]}
            />
            <LocationPicker
              label="City"
              value={city}
              onChange={setCity}
              placeholder="Select your city"
            />
          </div>
        </Section>

        {/* ── 5. Badges ─────────────────────────────────────────── */}
        <Section title="5. Badges & Amenity Pills" subtitle="Status badges + amenity tag splitter">
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">Status badges</p>
              <div className="flex flex-wrap gap-2 items-center">
                <Badge variant="verified" dot><Check size={11} />Verified</Badge>
                <Badge variant="available" dot>Available</Badge>
                <Badge variant="pending" dot>Pending</Badge>
                <Badge variant="unavailable" dot>Unavailable</Badge>
                <Badge variant="noshow" dot>No Show</Badge>
                <Badge variant="category">Hot Desk</Badge>
                <Badge variant="category">Zone B</Badge>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider mb-3">
                AmenityPillList — splits raw API comma string
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <code className="text-xs bg-[#f1f5f9] px-2 py-1 rounded text-[#475569]">
                    "WiFi,4K Monitor,Standing Desk,Power"
                  </code>
                  <span className="text-[#94a3b8] text-xs">→</span>
                  <AmenityPillList amenities="WiFi,4K Monitor,Standing Desk,Power" max={3} />
                </div>
                <div className="flex items-center gap-3">
                  <code className="text-xs bg-[#f1f5f9] px-2 py-1 rounded text-[#475569]">
                    "WiFi,Whiteboard,Projector,Power"
                  </code>
                  <span className="text-[#94a3b8] text-xs">→</span>
                  <AmenityPillList amenities="WiFi,Whiteboard,Projector,Power" max={2} />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 6. SpaceCard ──────────────────────────────────────── */}
        <Section title="6. SpaceCard" subtitle="Listing card — accepts DeskData shape directly from GET /desks/. Third card shows maintenance state.">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SAMPLE_DESKS.map((desk, i) => (
              <SpaceCard
                key={desk.id}
                desk={desk}
                image={DESK_IMAGES[i]}
                rating={[4.8, 4.6, 4.2][i]}
                reviewCount={[38, 21, 15][i]}
                onBook={(d) => alert(`Booking: ${d.desk_id}`)}
              />
            ))}
          </div>
          {/* Alert: no real images wired yet */}
          <div className="mt-4 flex items-start gap-2 p-3 rounded-xl bg-[#fef3c7] border border-[#fde68a] text-sm text-[#b45309]">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <p>
              Cards show placeholder icons because no real images are wired yet — pass an <code className="font-mono bg-[#fef3c7]">image</code> prop
              or leave it out and the card gracefully shows a desk icon.
            </p>
          </div>
        </Section>

      </main>

      {/* Live Footer preview */}
      <Footer />
    </div>
  );
}
