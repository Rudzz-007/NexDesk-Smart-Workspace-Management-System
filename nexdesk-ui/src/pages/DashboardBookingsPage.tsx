import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Clock, MapPin, ArrowRight, CheckCircle2,
  AlertTriangle, QrCode, XCircle, RefreshCw, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { STATUS_BADGE_MAP, type BookingSummary } from './DashboardOverview';

export default function DashboardBookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/bookings/me', {
        headers: user?.access_token ? { Authorization: `Bearer ${user.access_token}` } : {},
      });
      if (res.ok) {
        const data: BookingSummary[] = await res.json();
        setBookings(Array.isArray(data) ? data : []);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.access_token]);

  /* ── Handle Cancel Booking -> DELETE /bookings/{id} ── */
  const handleCancelBooking = async (bookingId: number) => {
    setCancellingId(bookingId);
    setActionMessage(null);
    try {
      const res = await fetch(`http://127.0.0.1:8000/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: user?.access_token ? { Authorization: `Bearer ${user.access_token}` } : {},
      });

      const data = await res.json();

      if (res.ok) {
        // Use returned message & status to update UI per specification
        setActionMessage({
          type: 'success',
          text: data.message || `Booking #${bookingId} successfully cancelled.`,
        });

        // Update local state with returned status
        setBookings(prev =>
          prev.map(b => (b.id === bookingId ? { ...b, status: data.status || 'cancelled' } : b))
        );
      } else {
        setActionMessage({
          type: 'error',
          text: data.detail || `Unable to cancel booking #${bookingId}.`,
        });
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: 'Network error communicating with server.',
      });
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">My Bookings</h1>
          <p className="text-sm text-[#64748b] mt-1">
            Manage your past and upcoming workspace reservations.
          </p>
        </div>
        <button
          onClick={fetchBookings}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[#e2e8f0] bg-white text-xs font-semibold text-[#475569] hover:bg-[#f8fafc] hover:text-[#0f172a] transition-colors cursor-pointer shadow-2xs"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          Refresh list
        </button>
      </div>

      {/* Returned Action Feedback Message */}
      {actionMessage && (
        <div
          className={[
            'p-4 rounded-xl border text-sm font-medium flex items-center justify-between gap-3',
            actionMessage.type === 'success'
              ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#166534]'
              : 'bg-[#fef2f2] border-[#fecaca] text-[#991b1b]',
          ].join(' ')}
        >
          <div className="flex items-center gap-2.5">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 size={18} className="text-[#16a34a] flex-shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-[#dc2626] flex-shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-semibold underline cursor-pointer opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="rounded-2xl border border-[#e2e8f0] bg-white p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4 flex-1 w-full">
                <div className="w-12 h-12 rounded-xl skeleton flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="w-48 h-5 rounded-md skeleton" />
                  <div className="w-64 h-4 rounded-md skeleton" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-6 rounded-md skeleton" />
                <div className="w-24 h-9 rounded-xl skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-[#e2e8f0] bg-white p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-[#eff6ff] flex items-center justify-center mx-auto mb-4">
            <CalendarDays size={26} className="text-[#3b82f6]" />
          </div>
          <h3 className="text-lg font-bold text-[#0f172a] mb-1.5">No bookings found</h3>
          <p className="text-sm text-[#64748b] max-w-md mx-auto mb-6">
            You don't have any active or past reservations. Explore our verified coworking spaces across India to make a booking.
          </p>
          <Link
            to="/browse"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3b82f6] text-white text-sm font-semibold hover:bg-[#2563eb] transition-colors shadow-sm"
          >
            Browse Workspaces
            <ArrowRight size={15} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(booking => {
            const badgeInfo = STATUS_BADGE_MAP[booking.status] || {
              variant: 'available',
              label: booking.status,
            };

            const canCancel = booking.status !== 'cancelled' && booking.status !== 'no_show';

            return (
              <div
                key={booking.id}
                className="rounded-2xl border border-[#e2e8f0] bg-white p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center font-bold text-sm flex-shrink-0">
                    #{booking.id}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-base font-bold text-[#0f172a]">
                        Workspace {booking.desk_id}
                      </h3>
                      <Badge variant={badgeInfo.variant} dot>
                        {badgeInfo.label}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-[#64748b]">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-[#94a3b8]" />
                        {new Date(booking.start_time).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                        {' · '}
                        {new Date(booking.start_time).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' – '}
                        {new Date(booking.end_time).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {booking.noshow_probability > 0 && (
                        <span className="text-[#64748b]">
                          ML No-Show Risk: {(booking.noshow_probability * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side actions & price */}
                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-[#f1f5f9]">
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-[#64748b]">Total</p>
                    <p className="text-lg font-bold text-[#0f172a]">
                      ₹{booking.final_price.toFixed(0)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/space/${booking.desk_id}`}
                      className="px-3.5 py-2 rounded-xl bg-[#eff6ff] text-[#3b82f6] text-xs font-semibold hover:bg-[#dbeafe] transition-colors"
                    >
                      Check-in
                    </Link>

                    {canCancel && (
                      <Button
                        variant="secondary"
                        size="sm"
                        loading={cancellingId === booking.id}
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-[#dc2626] hover:bg-[#fef2f2] border-[#fca5a5]"
                      >
                        Cancel booking
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
