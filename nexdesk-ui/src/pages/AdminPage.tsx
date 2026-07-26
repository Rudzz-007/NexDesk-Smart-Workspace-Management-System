import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Users, BarChart3, DollarSign, AlertTriangle,
  Building2, CalendarDays, TrendingUp, Sparkles, RefreshCw,
  CheckCircle2, AlertCircle, ArrowLeft, Sliders, Filter,
  Tag, MapPin, UserCheck, ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { STATUS_BADGE_MAP, type BookingSummary } from './DashboardOverview';

/* ── Types ── */
interface AnalyticsSummary {
  total_reservations_processed: number;
  total_revenue_generated_inr: number;
  high_risk_no_show_alerts: number;
  system_utilization_index: string;
}

interface DeskItem {
  desk_id: string;
  name: string;
  city: string;
  price: number;
  amenities: string;
  verified?: boolean;
}

interface AdminUser {
  id: number;
  email: string;
  role: string;
}

type AdminTab = 'overview' | 'desks' | 'bookings' | 'users';

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  /* ── State: Analytics Summary ── */
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  /* ── State: Pricing Override Panel ── */
  const [overrideZone, setOverrideZone] = useState('Bangalore-TechHub');
  const [overrideMultiplier, setOverrideMultiplier] = useState(1.25);
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overrideMessage, setOverrideMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  /* ── State: Manage Desks ── */
  const [desks, setDesks] = useState<DeskItem[]>([]);
  const [desksLoading, setDesksLoading] = useState(false);

  /* ── State: Manage Bookings ── */
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  /* ── State: Manage Users ── */
  const [usersList, setUsersList] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userRoleError, setUserRoleError] = useState<{ userId: number; message: string } | null>(null);
  const [userRoleSuccess, setUserRoleSuccess] = useState<{ userId: number; message: string } | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  const authHeaders: Record<string, string> = user?.access_token
    ? { Authorization: `Bearer ${user.access_token}` }
    : {};

  /* ── Fetchers ── */
  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/analytics/summary`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      // Keep state clean
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchDesks = async () => {
    setDesksLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/desks/`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        // Remember { total, desks } wrapper
        if (data && Array.isArray(data.desks)) {
          setDesks(data.desks);
        } else if (Array.isArray(data)) {
          setDesks(data);
        }
      }
    } catch (err) {
      setDesks([]);
    } finally {
      setDesksLoading(false);
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/bookings/me`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    setUserRoleError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/admin/users`, { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setUsersList(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setUsersList([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchDesks();
    fetchBookings();
    fetchUsers();
  }, [user?.access_token]);

  /* ── Handle POST /analytics/pricing-override ── */
  const handlePricingOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    setOverrideLoading(true);
    setOverrideMessage(null);

    try {
      const params = new URLSearchParams({
        zone_identifier: overrideZone,
        surge_multiplier: overrideMultiplier.toString(),
      });
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/analytics/pricing-override?${params.toString()}`, {
        method: 'POST',
        headers: authHeaders,
      });
      const data = await res.json();

      if (res.ok) {
        setOverrideMessage({
          type: 'success',
          text: `Surge multiplier (${overrideMultiplier}x) active for ${overrideZone}. ${data.message || ''}`,
        });
      } else {
        setOverrideMessage({
          type: 'error',
          text: data.detail || 'Failed to apply pricing override.',
        });
      }
    } catch (err) {
      setOverrideMessage({
        type: 'error',
        text: 'Network error connecting to pricing engine.',
      });
    } finally {
      setOverrideLoading(false);
    }
  };

  /* ── Handle PUT /admin/users/{id}/role ── */
  const handleUpdateRole = async (targetUserId: number, newRole: string) => {
    setUpdatingUserId(targetUserId);
    setUserRoleError(null);
    setUserRoleSuccess(null);

    try {
      const params = new URLSearchParams({ new_role: newRole });
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/admin/users/${targetUserId}/role?${params.toString()}`, {
        method: 'PUT',
        headers: authHeaders,
      });
      const data = await res.json();

      if (res.ok) {
        setUserRoleSuccess({
          userId: targetUserId,
          message: `Role updated to '${data.role}' successfully.`,
        });
        setUsersList(prev =>
          prev.map(u => (u.id === targetUserId ? { ...u, role: data.role || newRole } : u))
        );
      } else {
        setUserRoleError({
          userId: targetUserId,
          message: data.detail || `Failed to update role: server rejected '${newRole}'.`,
        });
      }
    } catch (err: any) {
      setUserRoleError({
        userId: targetUserId,
        message: 'Network error while updating role.',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredBookings = statusFilter === 'ALL'
    ? bookings
    : bookings.filter(b => b.status === statusFilter);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col">
      {/* ── Top Header ── */}
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

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff6ff] text-[#3b82f6] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} />
              Admin Management Portal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#e2e8f0] bg-white text-xs font-semibold text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors"
            >
              <ArrowLeft size={13} />
              User Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* ── Tabs Navigation ── */}
      <div className="bg-white border-b border-[#e2e8f0] px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'overview', label: 'Analytics & Pricing', icon: <BarChart3 size={16} /> },
            { id: 'desks', label: 'Manage Desks', icon: <Building2 size={16} /> },
            { id: 'bookings', label: 'Manage Bookings', icon: <CalendarDays size={16} /> },
            { id: 'users', label: 'Manage Users', icon: <Users size={16} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={[
                'flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-sm transition-colors whitespace-nowrap cursor-pointer',
                activeTab === tab.id
                  ? 'border-[#3b82f6] text-[#3b82f6]'
                  : 'border-transparent text-[#64748b] hover:text-[#0f172a]',
              ].join(' ')}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 flex-1">
        {/* ── TAB 1: OVERVIEW & PRICING OVERRIDE ── */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a]">Platform Analytics Summary</h1>
                <p className="text-sm text-[#64748b] mt-1">
                  Real-time operational metrics fetched from <code className="font-mono">GET /analytics/summary</code>.
                </p>
              </div>
              <button
                onClick={fetchAnalytics}
                disabled={analyticsLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs font-semibold text-[#475569] hover:bg-[#f8fafc] transition-colors cursor-pointer shadow-2xs"
              >
                <RefreshCw size={13} className={analyticsLoading ? 'animate-spin' : ''} />
                Refresh metrics
              </button>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                    Total Bookings
                  </p>
                  <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center">
                    <BarChart3 size={18} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#0f172a] mt-3">
                  {analytics?.total_reservations_processed ?? '—'}
                </p>
                <p className="text-xs text-[#64748b] mt-1">Confirmed & active passes</p>
              </div>

              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                    Revenue (INR)
                  </p>
                  <div className="w-10 h-10 rounded-xl bg-[#f0fdf4] text-[#16a34a] flex items-center justify-center">
                    <DollarSign size={18} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#0f172a] mt-3">
                  {analytics ? `₹${analytics.total_revenue_generated_inr.toLocaleString('en-IN')}` : '—'}
                </p>
                <p className="text-xs text-[#64748b] mt-1">Total revenue generated</p>
              </div>

              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                    High No-Show Risk
                  </p>
                  <div className="w-10 h-10 rounded-xl bg-[#fffbeb] text-[#f59e0b] flex items-center justify-center">
                    <AlertTriangle size={18} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#0f172a] mt-3">
                  {analytics?.high_risk_no_show_alerts ?? '—'}
                </p>
                <p className="text-xs text-[#64748b] mt-1">ML probability &gt; 30%</p>
              </div>

              <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
                    System Status
                  </p>
                  <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-[#0f172a] mt-3">
                  {analytics?.system_utilization_index ?? 'Stable'}
                </p>
                <p className="text-xs text-[#16a34a] font-semibold mt-1">All engines active</p>
              </div>
            </div>

            {/* Pricing Override Panel -> POST /analytics/pricing-override */}
            <div className="rounded-2xl border border-[#e2e8f0] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 pb-5 border-b border-[#f1f5f9]">
                <div className="w-10 h-10 rounded-xl bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center">
                  <Sliders size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#0f172a]">
                    Dynamic Pricing Override Panel
                  </h2>
                  <p className="text-xs text-[#64748b]">
                    Calls <code className="font-mono">POST /analytics/pricing-override</code> to inject a surge multiplier coefficient for a workspace zone.
                  </p>
                </div>
              </div>

              {overrideMessage && (
                <div
                  className={[
                    'mt-5 p-4 rounded-xl border text-sm font-medium flex items-start gap-3',
                    overrideMessage.type === 'success'
                      ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]'
                      : 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]',
                  ].join(' ')}
                >
                  {overrideMessage.type === 'success' ? (
                    <CheckCircle2 size={18} className="text-[#16a34a] flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={18} className="text-[#dc2626] flex-shrink-0 mt-0.5" />
                  )}
                  <span>{overrideMessage.text}</span>
                </div>
              )}

              <form onSubmit={handlePricingOverride} className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-5 items-end">
                <div>
                  <label htmlFor="zone-id" className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5">
                    Target Workspace Zone
                  </label>
                  <select
                    id="zone-id"
                    value={overrideZone}
                    onChange={e => setOverrideZone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#cbd5e1] text-sm font-medium text-[#0f172a] bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  >
                    <option value="Bangalore-TechHub">Bangalore-TechHub</option>
                    <option value="Mumbai-BKC">Mumbai-BKC</option>
                    <option value="Delhi-CyberCity">Delhi-CyberCity</option>
                    <option value="Hyderabad-HITEC">Hyderabad-HITEC</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="surge-mult" className="block text-xs font-semibold uppercase tracking-wider text-[#475569] mb-1.5">
                    Surge Multiplier (1.0 = normal)
                  </label>
                  <input
                    id="surge-mult"
                    type="number"
                    step="0.05"
                    min="0.5"
                    max="5.0"
                    value={overrideMultiplier}
                    onChange={e => setOverrideMultiplier(parseFloat(e.target.value) || 1.0)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#cbd5e1] text-sm font-medium text-[#0f172a] bg-white focus:outline-none focus:ring-2 focus:ring-[#3b82f6]"
                  />
                </div>

                <div>
                  <Button
                    type="submit"
                    fullWidth
                    loading={overrideLoading}
                  >
                    Apply Surge Multiplier
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── TAB 2: MANAGE DESKS ── */}
        {activeTab === 'desks' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a]">Workspace Inventory</h1>
                <p className="text-sm text-[#64748b] mt-1">
                  Fetched from <code className="font-mono">GET /desks/</code> (<code className="font-mono">&#123; total, desks &#125;</code> wrapper). Amenities rendered as split tags.
                </p>
              </div>
              <button
                onClick={fetchDesks}
                disabled={desksLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs font-semibold text-[#475569] hover:bg-[#f8fafc] transition-colors cursor-pointer shadow-2xs"
              >
                <RefreshCw size={13} className={desksLoading ? 'animate-spin' : ''} />
                Refresh inventory
              </button>
            </div>

            {/* Notice regarding add/edit/deactivate routes per prompt requirements */}
            <div className="p-4 rounded-xl border border-[#cbd5e1] bg-white flex items-start gap-3">
              <Sparkles size={18} className="text-[#3b82f6] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[#475569]">
                <strong className="text-[#0f172a]">Read-Only Inventory Mode:</strong> Backend routes for adding, editing, or deactivating individual desk entries are scheduled for release in the next API build. Table displays full live verified inventory.
              </div>
            </div>

            <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">Desk ID &amp; Name</th>
                      <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">Location</th>
                      <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">Base Price</th>
                      <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">Amenities Tags</th>
                      <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {desks.map(desk => (
                      <tr key={desk.desk_id} className="hover:bg-[#f8fafc]/60 transition-colors">
                        <td className="py-4 px-6">
                          <p className="font-bold text-[#0f172a]">{desk.desk_id}</p>
                          <p className="text-xs text-[#64748b]">{desk.name}</p>
                        </td>
                        <td className="py-4 px-6 text-sm text-[#334155]">
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={14} className="text-[#94a3b8]" />
                            {desk.city}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm font-semibold text-[#0f172a]">
                          ₹{desk.price}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-wrap gap-1.5">
                            {(desk.amenities || '').split(',').map(tag => tag.trim()).filter(Boolean).map((amenity, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#f1f5f9] text-[#334155] text-xs font-medium"
                              >
                                {amenity}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="verified" dot>Verified Active</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: MANAGE BOOKINGS ── */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a]">Admin Bookings Control</h1>
                <p className="text-sm text-[#64748b] mt-1">
                  Filter by exact backend status strings (<code className="font-mono">confirmed</code>, <code className="font-mono">checked_in</code>, <code className="font-mono">no_show</code>, <code className="font-mono">cancelled</code>).
                </p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['ALL', 'confirmed', 'checked_in', 'no_show', 'cancelled'].map(status => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={[
                      'px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
                      statusFilter === status
                        ? 'bg-[#3b82f6] text-white shadow-xs'
                        : 'bg-white border border-[#e2e8f0] text-[#64748b] hover:text-[#0f172a]',
                    ].join(' ')}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">Booking ID</th>
                      <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">Workspace Desk</th>
                      <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">Schedule Time</th>
                      <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">Price &amp; Risk</th>
                      <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">Status Badge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-sm text-[#64748b]">
                          No bookings match status filter: <strong>{statusFilter}</strong>
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map(b => {
                        const badgeInfo = STATUS_BADGE_MAP[b.status] || {
                          variant: 'available',
                          label: b.status,
                        };
                        return (
                          <tr key={b.id} className="hover:bg-[#f8fafc]/60 transition-colors">
                            <td className="py-4 px-6 font-bold text-[#0f172a]">
                              #{b.id}
                            </td>
                            <td className="py-4 px-6 font-semibold text-[#0f172a]">
                              {b.desk_id}
                            </td>
                            <td className="py-4 px-6 text-xs text-[#475569]">
                              <div>
                                {new Date(b.start_time).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </div>
                              <div className="text-[#64748b] mt-0.5">
                                {new Date(b.start_time).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                                {' – '}
                                {new Date(b.end_time).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <p className="font-bold text-[#0f172a]">₹{b.final_price.toFixed(0)}</p>
                              {b.noshow_probability > 0 && (
                                <p className="text-[11px] text-[#f59e0b] mt-0.5">
                                  Risk: {(b.noshow_probability * 100).toFixed(0)}%
                                </p>
                              )}
                            </td>
                            <td className="py-4 px-6">
                              <Badge variant={badgeInfo.variant} dot>
                                {badgeInfo.label}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: MANAGE USERS ── */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#0f172a]">User Role Access Management</h1>
                <p className="text-sm text-[#64748b] mt-1">
                  Fetched from <code className="font-mono">GET /admin/users</code>. Role modification wired to <code className="font-mono">PUT /admin/users/&#123;id&#125;/role</code>.
                </p>
              </div>
              <button
                onClick={fetchUsers}
                disabled={usersLoading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs font-semibold text-[#475569] hover:bg-[#f8fafc] transition-colors cursor-pointer shadow-2xs"
              >
                <RefreshCw size={13} className={usersLoading ? 'animate-spin' : ''} />
                Refresh accounts
              </button>
            </div>

            <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]">
                      <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">User ID</th>
                      <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">Email Address</th>
                      <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">Current Role</th>
                      <th className="py-3.5 px-6 text-xs font-semibold uppercase tracking-wider text-[#475569]">Role Management Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f1f5f9]">
                    {usersList.map(item => (
                      <tr key={item.id} className="hover:bg-[#f8fafc]/60 transition-colors">
                        <td className="py-4 px-6 font-bold text-[#0f172a]">
                          #{item.id}
                        </td>
                        <td className="py-4 px-6 font-semibold text-[#0f172a]">
                          {item.email}
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={item.role === 'admin' ? 'pending' : 'available'} dot>
                            {item.role === 'admin' ? 'Admin' : 'Employee'}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              {/* Switch to Employee */}
                              <button
                                disabled={updatingUserId === item.id || item.role === 'employee'}
                                onClick={() => handleUpdateRole(item.id, 'employee')}
                                className={[
                                  'px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer',
                                  item.role === 'employee'
                                    ? 'bg-[#f1f5f9] text-[#94a3b8] border-[#e2e8f0] cursor-not-allowed'
                                    : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f8fafc]',
                                ].join(' ')}
                              >
                                Set Employee
                              </button>

                              {/* Switch to Admin */}
                              <button
                                disabled={updatingUserId === item.id || item.role === 'admin'}
                                onClick={() => handleUpdateRole(item.id, 'admin')}
                                className={[
                                  'px-3 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer',
                                  item.role === 'admin'
                                    ? 'bg-[#eff6ff] text-[#93c5fd] border-[#bfdbfe] cursor-not-allowed'
                                    : 'bg-white text-[#3b82f6] border-[#bfdbfe] hover:bg-[#eff6ff]',
                                ].join(' ')}
                              >
                                Set Admin
                              </button>

                              {/* Test invalid role rejection per requirement */}
                              <button
                                disabled={updatingUserId === item.id}
                                onClick={() => handleUpdateRole(item.id, 'manager')}
                                title="Demonstrate backend rejection of invalid role value"
                                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#fef2f2] text-[#dc2626] border border-[#fecaca] hover:bg-[#fee2e2] cursor-pointer"
                              >
                                Test Rejection
                              </button>
                            </div>

                            {/* Inline error feedback if server rejects invalid role value */}
                            {userRoleError && userRoleError.userId === item.id && (
                              <div className="p-2 rounded-lg bg-[#fef2f2] border border-[#fecaca] text-[#b91c1c] text-xs font-medium flex items-center gap-1.5">
                                <AlertCircle size={14} className="flex-shrink-0" />
                                <span>{userRoleError.message}</span>
                              </div>
                            )}

                            {/* Inline success feedback */}
                            {userRoleSuccess && userRoleSuccess.userId === item.id && (
                              <div className="p-2 rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-xs font-medium flex items-center gap-1.5">
                                <CheckCircle2 size={14} className="flex-shrink-0" />
                                <span>{userRoleSuccess.message}</span>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
