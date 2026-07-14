import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Wifi, Monitor, Zap, ShieldCheck, Calendar,
  Clock, CheckCircle2, AlertTriangle, QrCode, X, RefreshCw,
  Maximize2, Coffee, Printer, Lock, Users, Sparkles, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SpaceCard, type DeskData } from '@/components/ui/SpaceCard';
import { useAuth } from '@/context/AuthContext';

/* ─── Fallback desks for offline / public browsing ───────────────────────── */
const FALLBACK_DESKS: DeskData[] = [
  { id: 1, desk_id: 'DESK-BLR-01', location: 'Koramangala, Bangalore', base_price: 149, amenities: 'WiFi,Monitor,Coffee,AC', is_active: 'available' },
  { id: 2, desk_id: 'DESK-BLR-02', location: 'Indiranagar, Bangalore', base_price: 189, amenities: 'WiFi,Standing Desk,Monitor,Power', is_active: 'available' },
  { id: 3, desk_id: 'DESK-MUM-01', location: 'BKC, Mumbai', base_price: 249, amenities: 'WiFi,Standing Desk,Locker,Coffee', is_active: 'available' },
  { id: 4, desk_id: 'DESK-MUM-02', location: 'Lower Parel, Mumbai', base_price: 219, amenities: 'WiFi,Printer,Lounge,AC', is_active: 'available' },
  { id: 5, desk_id: 'DESK-DEL-01', location: 'Connaught Place, Delhi NCR', base_price: 159, amenities: 'WiFi,Printer,Coffee,Power', is_active: 'available' },
  { id: 6, desk_id: 'DESK-DEL-02', location: 'Cyber Hub, Delhi NCR', base_price: 199, amenities: 'WiFi,Monitor,Standing Desk,Locker', is_active: 'available' },
];

/* ─── High-resolution workspace placeholder photos ───────────────────────── */
const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&auto=format&fit=crop',
];

/* ─── SVG QR Code Generator for Token Display ────────────────────────────── */
function VisualQRCode({ token }: { token: string }) {
  // Generate deterministic grid pattern from token characters
  const grid: boolean[][] = useMemo(() => {
    const matrix: boolean[][] = Array.from({ length: 15 }, () => Array(15).fill(false));
    // Set locator squares (top-left, top-right, bottom-left)
    const drawLocator = (r0: number, c0: number) => {
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          if (r === 0 || r === 4 || c === 0 || c === 4 || (r >= 1 && r <= 3 && c >= 1 && c <= 3)) {
            matrix[r0 + r][c0 + c] = true;
          }
        }
      }
    };
    drawLocator(0, 0);
    drawLocator(0, 10);
    drawLocator(10, 0);

    // Hash token string to fill data cells
    let seed = 0;
    for (let i = 0; i < token.length; i++) {
      seed = (seed * 31 + token.charCodeAt(i)) >>> 0;
    }
    for (let r = 0; r < 15; r++) {
      for (let c = 0; c < 15; c++) {
        if ((r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c < 6)) continue;
        seed = (seed * 1664525 + 1013904223) >>> 0;
        matrix[r][c] = (seed & 1) === 1;
      }
    }
    return matrix;
  }, [token]);

  return (
    <div className="p-3 bg-white border-2 border-[#e2e8f0] rounded-xl inline-block shadow-sm">
      <svg viewBox="0 0 15 15" className="w-44 h-44 block">
        {grid.map((row, r) =>
          row.map((active, c) =>
            active ? (
              <rect key={`${r}-${c}`} x={c} y={r} width={1} height={1} fill="#0f172a" />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

/* ─── Amenity Icon Helper ────────────────────────────────────────────────── */
function getAmenityIcon(label: string): React.ReactNode {
  const clean = label.trim().toLowerCase();
  if (clean.includes('wifi')) return <Wifi size={15} className="text-[#3b82f6]" />;
  if (clean.includes('monitor') || clean.includes('display')) return <Monitor size={15} className="text-[#3b82f6]" />;
  if (clean.includes('power') || clean.includes('zap')) return <Zap size={15} className="text-[#f59e0b]" />;
  if (clean.includes('coffee') || clean.includes('tea')) return <Coffee size={15} className="text-[#8b5cf6]" />;
  if (clean.includes('print')) return <Printer size={15} className="text-[#10b981]" />;
  if (clean.includes('lock')) return <Lock size={15} className="text-[#6366f1]" />;
  return <Sparkles size={15} className="text-[#3b82f6]" />;
}

export default function SpaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  /* ── Desk data state ── */
  const [desk, setDesk] = useState<DeskData | null>(null);
  const [allDesks, setAllDesks] = useState<DeskData[]>([]);
  const [loadingDesk, setLoadingDesk] = useState<boolean>(true);

  /* ── Gallery state ── */
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);

  /* ── Booking form state ── */
  const [bookingDate, setBookingDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow by default
  );
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [bookingLoading, setBookingLoading] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  /* ── Successful booking state ── */
  const [bookedRecord, setBookedRecord] = useState<{
    id: number;
    desk_id: string;
    start_time: string;
    end_time: string;
    final_price: number;
    noshow_probability?: number | null;
    status: string;
  } | null>(null);

  /* ── Check-in state ── */
  const [checkinToken, setCheckinToken] = useState<string | null>(null);
  const [checkinLoading, setCheckinLoading] = useState<boolean>(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);

  /* ── Verify kiosk state ── */
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<'success' | 'expired' | 'error' | null>(null);

  /* ── Fetch desks & resolve current desk ── */
  useEffect(() => {
    let mounted = true;
    setLoadingDesk(true);

    const loadDeskData = async () => {
      try {
        const headers: Record<string, string> = {};
        if (user?.access_token) {
          headers['Authorization'] = `Bearer ${user.access_token}`;
        }
        const res = await fetch('http://127.0.0.1:8000/desks/', { headers });
        let list: DeskData[] = [];
        if (res.ok) {
          const data = await res.json();
          list = Array.isArray(data) ? data : (data.desks ?? []);
        } else {
          list = FALLBACK_DESKS;
        }
        if (!mounted) return;
        setAllDesks(list);

        const match = list.find(
          d => String(d.id) === id || d.desk_id.toLowerCase() === id?.toLowerCase()
        );
        if (match) {
          setDesk(match);
        } else if (list.length > 0) {
          setDesk(list[0]);
        }
      } catch {
        if (!mounted) return;
        setAllDesks(FALLBACK_DESKS);
        const match = FALLBACK_DESKS.find(
          d => String(d.id) === id || d.desk_id.toLowerCase() === id?.toLowerCase()
        );
        setDesk(match || FALLBACK_DESKS[0]);
      } finally {
        if (mounted) setLoadingDesk(false);
      }
    };

    loadDeskData();
    return () => { mounted = false; };
  }, [id, user]);

  /* ── Auto-release countdown timer ── */
  useEffect(() => {
    if (countdownSeconds === null || countdownSeconds <= 0) return;
    const timer = setInterval(() => {
      setCountdownSeconds(prev => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdownSeconds]);

  /* ── Handle Booking Submission ── */
  const handleBookNow = async () => {
    if (!isLoggedIn || !user?.access_token) {
      navigate(`/login?redirect=/space/${id}`);
      return;
    }
    if (!desk) return;

    setBookingLoading(true);
    setBookingError(null);
    setBookedRecord(null);

    try {
      const startIso = `${bookingDate}T${startTime}:00`;
      const endIso = `${bookingDate}T${endTime}:00`;

      const payload = {
        desk_id: desk.desk_id,
        start_time: startIso,
        end_time: endIso
      };

      const res = await fetch('http://127.0.0.1:8000/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.status === 201 || res.ok) {
        setBookedRecord(data);
      } else if (res.status === 409) {
        setBookingError('Conflict detected: This desk is already reserved during this timeframe. Please select another time.');
      } else {
        setBookingError(data?.detail || 'Booking failed. Please verify your time window (start time before end time).');
      }
    } catch (err: any) {
      setBookingError(err?.message || 'Network error while placing booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  /* ── Handle Generate Check-in Code ── */
  const handleGenerateCheckin = async () => {
    if (!bookedRecord || !user?.access_token) return;
    setCheckinLoading(true);
    setCheckinError(null);
    setVerifyStatus(null);
    setVerifyMessage(null);

    try {
      const res = await fetch(`http://127.0.0.1:8000/checkin/initialize/${bookedRecord.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setCheckinToken(data.qr_token_string);
        setCountdownSeconds(data.auto_release_window_seconds || 30);
      } else {
        setCheckinError(data?.detail || 'Failed to initialize check-in QR code.');
      }
    } catch (err: any) {
      setCheckinError(err?.message || 'Network error initializing check-in token.');
    } finally {
      setCheckinLoading(false);
    }
  };

  /* ── Handle Verify Action (POST /checkin/verify?token_string=...) ── */
  const handleVerifyKiosk = async () => {
    if (!checkinToken || !user?.access_token) return;
    setVerifyLoading(true);
    setVerifyStatus(null);
    setVerifyMessage(null);

    try {
      const url = `http://127.0.0.1:8000/checkin/verify?token_string=${encodeURIComponent(checkinToken)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.access_token}`
        }
      });

      const data = await res.json();

      if (res.status === 410) {
        setVerifyStatus('expired');
        setVerifyMessage(data?.detail || 'Verification window expired. Slot already auto-released by system.');
      } else if (res.ok) {
        setVerifyStatus('success');
        setVerifyMessage(data?.message || `Physical presence verified for desk ${desk?.desk_id}. Access granted.`);
      } else {
        setVerifyStatus('error');
        setVerifyMessage(data?.detail || 'QR verification failed.');
      }
    } catch (err: any) {
      setVerifyStatus('error');
      setVerifyMessage(err?.message || 'Network error verifying QR token.');
    } finally {
      setVerifyLoading(false);
    }
  };

  /* ── Similar desks (same list minus current) ── */
  const similarDesks = useMemo(() => {
    if (!desk) return [];
    return allDesks.filter(d => d.id !== desk.id).slice(0, 3);
  }, [allDesks, desk]);

  if (loadingDesk) {
    return (
      <div className="container-nd py-12">
        <div className="h-96 rounded-2xl bg-[#f1f5f9] animate-pulse mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 bg-[#f1f5f9] rounded-lg w-1/2 animate-pulse" />
            <div className="h-4 bg-[#f1f5f9] rounded w-1/3 animate-pulse" />
            <div className="h-28 bg-[#f1f5f9] rounded-xl animate-pulse" />
          </div>
          <div className="h-80 bg-[#f1f5f9] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!desk) {
    return (
      <div className="container-nd py-16 text-center">
        <h2 className="text-2xl font-bold text-[#0f172a]">Desk Not Found</h2>
        <p className="text-[#64748b] mt-2 mb-6">The requested workspace desk ID could not be located.</p>
        <Link to="/browse">
          <Button size="md">Back to Browse</Button>
        </Link>
      </div>
    );
  }

  const amenitiesList = (desk.amenities || 'WiFi,Monitor,Power').split(',').map(a => a.trim()).filter(Boolean);

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8">
      <div className="container-nd">
        
        {/* Back navigation */}
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748b] hover:text-[#3b82f6] mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Browse Desks
        </Link>

        {/* ════════════════════════════════════════════════════════════════
            1. IMAGE GALLERY (Main image + thumbnail strip + Lightbox modal)
        ════════════════════════════════════════════════════════════════ */}
        <div className="mb-8">
          <div
            onClick={() => setLightboxOpen(true)}
            className="group relative w-full aspect-[21/9] rounded-2xl overflow-hidden bg-[#e2e8f0] cursor-pointer shadow-md mb-3"
          >
            <img
              src={GALLERY_IMAGES[selectedImageIdx]}
              alt={`Desk ${desk.desk_id}`}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-[#0f172a] px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg">
                <Maximize2 size={16} />
                View Full Gallery
              </span>
            </div>
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant="verified" dot>Verified Workspace</Badge>
            </div>
          </div>

          {/* Thumbnail strip */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {GALLERY_IMAGES.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIdx(idx)}
                className={[
                  'relative w-24 sm:w-32 aspect-[16/10] rounded-xl overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0',
                  selectedImageIdx === idx
                    ? 'border-[#3b82f6] shadow-md scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100'
                ].join(' ')}
              >
                <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            2. LEFT & RIGHT COLUMNS
        ════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ── LEFT COLUMN: Details & Description ── */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Header info */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-[#0f172a]">{desk.desk_id}</h1>
                    <Badge variant="verified" dot>Verified</Badge>
                  </div>
                  <p className="flex items-center gap-1.5 text-sm font-medium text-[#64748b] mt-1.5">
                    <MapPin size={16} className="text-[#3b82f6] flex-shrink-0" />
                    <span>{desk.location}</span>
                  </p>
                </div>
              </div>

              {/* Amenities tags */}
              <div className="mt-6 pt-6 border-t border-[#f1f5f9]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#64748b] mb-3">
                  Included Amenities
                </h3>
                <div className="flex flex-wrap gap-2.5">
                  {amenitiesList.map(item => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-sm font-medium text-[#334155]"
                    >
                      {getAmenityIcon(item)}
                      <span>{item}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Workspace Description */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-xs">
              <h3 className="text-lg font-bold text-[#0f172a] mb-3">About this Workspace</h3>
              <p className="text-[#475569] text-sm leading-relaxed space-y-3">
                Located in the heart of {desk.location}, <strong className="text-[#0f172a]">{desk.desk_id}</strong> is a high-productivity hot desk designed for focused work and seamless professional collaboration. Equipped with ergonomic seating, ample natural light, and high-speed enterprise Wi-Fi.
              </p>
              <p className="text-[#475569] text-sm leading-relaxed mt-3">
                Every reservation features NexDesk's automated check-in engine and ML dynamic pricing. Simply scan your QR token upon arrival to verify physical presence.
              </p>
            </div>

            {/* ════════════════════════════════════════════════════════════════
                4. CHECK-IN PANEL (Shown AFTER successful booking)
            ════════════════════════════════════════════════════════════════ */}
            {bookedRecord && (
              <div className="bg-gradient-to-br from-[#eff6ff] to-[#f0fdf4] rounded-2xl border-2 border-[#bfdbfe] p-6 shadow-md">
                <div className="flex items-center gap-2 text-[#1d4ed8] font-bold text-lg mb-2">
                  <CheckCircle2 size={22} className="text-[#16a34a]" />
                  <span>Booking Confirmed! (ID: #{bookedRecord.id})</span>
                </div>

                {/* ML Confirmation details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/80 rounded-xl p-4 border border-[#bfdbfe] my-4">
                  <div>
                    <p className="text-xs text-[#64748b]">Estimated Final Price</p>
                    <p className="text-xl font-bold text-[#0f172a]">₹{bookedRecord.final_price.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#64748b]">ML No-Show Prediction</p>
                    <p className="text-sm font-semibold text-[#334155]">
                      {bookedRecord.noshow_probability !== null && bookedRecord.noshow_probability !== undefined ? (
                        <span>
                          {(bookedRecord.noshow_probability * 100).toFixed(0)}% Probability
                        </span>
                      ) : (
                        'Low Risk'
                      )}
                    </p>
                  </div>
                </div>

                {/* Reminder alert */}
                {bookedRecord.noshow_probability !== null && bookedRecord.noshow_probability !== undefined && bookedRecord.noshow_probability > 0.2 && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] text-[#92400e] text-xs font-medium mb-4">
                    <AlertTriangle size={16} className="text-[#d97706] flex-shrink-0" />
                    <span>Gentle reminder: Please check in on time to prevent auto-release inventory reclamation.</span>
                  </div>
                )}

                {/* Check-In Code Section */}
                {!checkinToken ? (
                  <div className="pt-2">
                    <Button
                      size="lg"
                      leftIcon={<QrCode size={18} />}
                      onClick={handleGenerateCheckin}
                      loading={checkinLoading}
                    >
                      Generate Check-in Code
                    </Button>
                    {checkinError && (
                      <p className="text-xs text-[#dc2626] mt-2">{checkinError}</p>
                    )}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-[#cbd5e1] p-5 mt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <VisualQRCode token={checkinToken} />
                      <div className="flex-1 text-center sm:text-left">
                        <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                          Secure QR Token
                        </p>
                        <p className="text-base font-mono font-bold text-[#0f172a] mt-1 break-all bg-[#f1f5f9] px-3 py-2 rounded-lg border border-[#e2e8f0]">
                          {checkinToken}
                        </p>
                        
                        {/* Live Auto-Release Countdown Timer */}
                        <div className="mt-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-[#334155]">
                            <Clock size={16} className="text-[#3b82f6]" />
                            <span>Auto-release Window:</span>
                            <span className={[
                              'font-mono px-2 py-0.5 rounded font-bold',
                              (countdownSeconds ?? 0) <= 10
                                ? 'bg-[#fee2e2] text-[#dc2626] animate-pulse'
                                : 'bg-[#eff6ff] text-[#2563eb]'
                            ].join(' ')}>
                              {countdownSeconds ?? 0}s remaining
                            </span>
                          </div>
                          {(countdownSeconds ?? 0) <= 10 && (countdownSeconds ?? 0) > 0 && (
                            <p className="text-xs text-[#dc2626] font-medium mt-1">
                              Warning: Auto-release watchdog window expiring soon!
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Verification / Kiosk Test Action */}
                    <div className="pt-4 border-t border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold text-[#475569]">
                          Kiosk Scanner Simulation
                        </p>
                        <p className="text-xs text-[#94a3b8]">
                          Calls POST /checkin/verify?token_string=...
                        </p>
                      </div>
                      <Button
                        size="md"
                        variant="secondary"
                        onClick={handleVerifyKiosk}
                        loading={verifyLoading}
                      >
                        Verify Physical Presence
                      </Button>
                    </div>

                    {/* Verification Outcome Message */}
                    {verifyStatus && (
                      <div className={[
                        'p-3.5 rounded-xl border text-sm font-medium flex items-center gap-2.5',
                        verifyStatus === 'success' ? 'bg-[#f0fdf4] border-[#bbf7d0] text-[#16a34a]' :
                        verifyStatus === 'expired' ? 'bg-[#fee2e2] border-[#fecaca] text-[#dc2626]' :
                        'bg-[#fffbeb] border-[#fde68a] text-[#b45309]'
                      ].join(' ')}>
                        {verifyStatus === 'success' && <CheckCircle2 size={18} />}
                        {verifyStatus === 'expired' && <AlertTriangle size={18} />}
                        {verifyStatus === 'error'   && <AlertCircle size={18} />}
                        <span>{verifyMessage}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: Sticky Booking Card (Desktop & Mobile) ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-[#e2e8f0] p-6 shadow-md space-y-6">
              
              {/* Price Display */}
              <div className="flex items-baseline justify-between pb-4 border-b border-[#f1f5f9]">
                <div>
                  <span className="text-3xl font-bold text-[#0f172a]">
                    ₹{desk.base_price.toFixed(0)}
                  </span>
                  <span className="text-sm font-medium text-[#64748b] ml-1">/ session</span>
                </div>
                <Badge variant="available">Active & Available</Badge>
              </div>

              {/* Booking Conflict Error Message */}
              {bookingError && (
                <div className="p-3.5 rounded-xl bg-[#fee2e2] border border-[#fecaca] text-[#b91c1c] text-xs font-medium flex items-start gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Date & Time Picker Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-1.5">
                    Reservation Date
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3b82f6]" />
                    <input
                      type="date"
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setBookingDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#eff6ff] bg-white cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-1.5">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={e => setStartTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] focus:outline-none focus:border-[#3b82f6] bg-white cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-1.5">
                      End Time
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={e => setEndTime(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#cbd5e1] text-sm text-[#0f172a] focus:outline-none focus:border-[#3b82f6] bg-white cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Book Now Button & Unauthenticated Helper */}
              <div className="pt-2">
                {!isLoggedIn ? (
                  <div className="space-y-2">
                    <Button
                      fullWidth
                      size="lg"
                      disabled
                      className="opacity-70 cursor-not-allowed"
                    >
                      Book Now
                    </Button>
                    <p className="text-xs text-[#64748b] text-center">
                      You must be logged in to reserve this workspace.{' '}
                      <Link
                        to={`/login?redirect=/space/${id}`}
                        className="text-[#3b82f6] font-semibold hover:underline"
                      >
                        Log In
                      </Link>
                    </p>
                  </div>
                ) : (
                  <Button
                    fullWidth
                    size="lg"
                    onClick={handleBookNow}
                    loading={bookingLoading}
                  >
                    Book Now
                  </Button>
                )}
              </div>

              <div className="pt-4 border-t border-[#f1f5f9] text-xs text-[#94a3b8] space-y-1.5">
                <p className="flex items-center justify-between">
                  <span>ML Dynamic Coefficient</span>
                  <span className="font-semibold text-[#475569]">Active</span>
                </p>
                <p className="flex items-center justify-between">
                  <span>Auto-Release Watchdog</span>
                  <span className="font-semibold text-[#475569]">30s window</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            5. SIMILAR DESKS ROW
        ════════════════════════════════════════════════════════════════ */}
        {similarDesks.length > 0 && (
          <div className="mt-16 pt-10 border-t border-[#e2e8f0]">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-6">
              Similar Desks You Might Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarDesks.map((sim, idx) => (
                <SpaceCard
                  key={sim.id}
                  desk={sim}
                  image={GALLERY_IMAGES[(idx + 1) % GALLERY_IMAGES.length]}
                  rating={+(4.4 + idx * 0.1).toFixed(1)}
                  reviewCount={20 + idx * 6}
                  onBook={() => navigate(`/space/${sim.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Lightbox Modal ── */}
        {lightboxOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            <div className="max-w-4xl w-full">
              <img
                src={GALLERY_IMAGES[selectedImageIdx]}
                alt="Full preview"
                className="w-full max-h-[80vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
