import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Filter, SlidersHorizontal, Search, X, MapPin, Check,
  ShieldCheck, AlertCircle, RefreshCw, ChevronDown, Sparkles,
  Sliders, ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SpaceCard, type DeskData } from '@/components/ui/SpaceCard';
import { useAuth } from '@/context/AuthContext';

/* ─── High-quality fallback desks for unauthenticated / demo mode ──── */
const FALLBACK_DESKS: DeskData[] = [
  { id: 1, desk_id: 'DESK-BLR-01', location: 'Koramangala, Bangalore', base_price: 149, amenities: 'WiFi,Monitor,Coffee,AC', is_active: 'available' },
  { id: 2, desk_id: 'DESK-BLR-02', location: 'Indiranagar, Bangalore', base_price: 189, amenities: 'WiFi,Standing Desk,Monitor,Power', is_active: 'available' },
  { id: 3, desk_id: 'DESK-MUM-01', location: 'BKC, Mumbai', base_price: 249, amenities: 'WiFi,Standing Desk,Locker,Coffee', is_active: 'available' },
  { id: 4, desk_id: 'DESK-MUM-02', location: 'Lower Parel, Mumbai', base_price: 219, amenities: 'WiFi,Printer,Lounge,AC', is_active: 'available' },
  { id: 5, desk_id: 'DESK-DEL-01', location: 'Connaught Place, Delhi NCR', base_price: 159, amenities: 'WiFi,Printer,Coffee,Power', is_active: 'available' },
  { id: 6, desk_id: 'DESK-DEL-02', location: 'Cyber Hub, Delhi NCR', base_price: 199, amenities: 'WiFi,Monitor,Standing Desk,Locker', is_active: 'available' },
  { id: 7, desk_id: 'DESK-HYD-01', location: 'HITEC City, Hyderabad', base_price: 129, amenities: 'WiFi,Monitor,AC,Coffee', is_active: 'available' },
  { id: 8, desk_id: 'DESK-HYD-02', location: 'Gachibowli, Hyderabad', base_price: 139, amenities: 'WiFi,Power,Lounge', is_active: 'available' },
  { id: 9, desk_id: 'DESK-PUN-01', location: 'Hinjewadi, Pune', base_price: 109, amenities: 'WiFi,Coffee,Lounge,AC', is_active: 'available' },
  { id: 10, desk_id: 'DESK-CHE-01', location: 'OMR, Chennai', base_price: 119, amenities: 'WiFi,Monitor,Power,Printer', is_active: 'available' },
  { id: 11, desk_id: 'DESK-BLR-03', location: 'Whitefield, Bangalore', base_price: 139, amenities: 'WiFi,Monitor,Power', is_active: 'available' },
  { id: 12, desk_id: 'DESK-MUM-03', location: 'Andheri East, Mumbai', base_price: 179, amenities: 'WiFi,AC,Coffee,Locker', is_active: 'available' },
];

const DESK_IMAGES = [
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1562664377-709f2c337eb2?w=600&auto=format&fit=crop',
];

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  /* ── Raw desks from GET /desks/ ── */
  const [rawDesks, setRawDesks] = useState<DeskData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Filter state ── */
  const [searchQuery, setSearchQuery] = useState<string>(searchParams.get('q') || '');
  const [selectedCity, setSelectedCity] = useState<string>(searchParams.get('city') || 'All');
  const [maxPrice, setMaxPrice] = useState<number>(350);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'name-asc'>('recommended');

  /* ── Mobile Filter Drawer ── */
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  /* ── Pagination / visible count ── */
  const [visibleCount, setVisibleCount] = useState<number>(9);

  /* ── Fetch desks from backend API ── */
  const fetchDesks = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (user?.access_token) {
        headers['Authorization'] = `Bearer ${user.access_token}`;
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/desks/`, { headers });
      if (res.ok) {
        // API returns { total: number, desks: DeskData[] }
        const data = await res.json();
        const deskList: DeskData[] = Array.isArray(data) ? data : (data.desks ?? []);
        setRawDesks(deskList);
      } else if (res.status === 401) {
        // If unauthenticated, gracefully load fallback desks so users can browse publicly
        setRawDesks(FALLBACK_DESKS);
      } else {
        throw new Error(`Server responded with status ${res.status}`);
      }
    } catch (err: any) {
      // If server is unreachable or throws, allow user to view fallback desks or retry
      setError(err?.message || 'Failed to fetch desks from backend');
      setRawDesks(FALLBACK_DESKS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesks();
  }, [user]);

  /* ── Derive available cities client-side ── */
  const availableCities = useMemo(() => {
    const citiesSet = new Set<string>();
    rawDesks.forEach(desk => {
      const parts = desk.location.split(',');
      const cityPart = parts.length > 1 ? parts[parts.length - 1].trim() : desk.location.trim();
      if (cityPart) citiesSet.add(cityPart);
    });
    return ['All', ...Array.from(citiesSet)];
  }, [rawDesks]);

  /* ── Derive all unique amenities dynamically from desks ── */
  const derivedAmenities = useMemo(() => {
    const counts: Record<string, number> = {};
    rawDesks.forEach(desk => {
      if (desk.amenities) {
        desk.amenities.split(',').forEach(item => {
          const clean = item.trim();
          if (clean) counts[clean] = (counts[clean] || 0) + 1;
        });
      }
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [rawDesks]);

  /* ── Toggle amenity checkbox ── */
  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
    setVisibleCount(9);
  };

  /* ── Clear all filters ── */
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCity('All');
    setMaxPrice(350);
    setSelectedAmenities([]);
    setVerifiedOnly(false);
    setSearchParams({});
    setVisibleCount(9);
  };

  /* ── Count active filters ── */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (selectedCity !== 'All') count++;
    if (maxPrice < 350) count++;
    count += selectedAmenities.length;
    if (verifiedOnly) count++;
    return count;
  }, [searchQuery, selectedCity, maxPrice, selectedAmenities, verifiedOnly]);

  /* 
   * ── Client-Side Filtering & Sorting ──
   * TODO: Future backend pass - move city, min_price, max_price, and amenity filters
   * directly to GET /desks/ query parameters once server-side filtering is supported.
   */
  const filteredDesks = useMemo(() => {
    let list = [...rawDesks];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d =>
        d.desk_id.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        (d.amenities && d.amenities.toLowerCase().includes(q))
      );
    }

    // City filter
    if (selectedCity && selectedCity !== 'All') {
      list = list.filter(d => d.location.toLowerCase().includes(selectedCity.toLowerCase()));
    }

    // Price range filter
    list = list.filter(d => d.base_price <= maxPrice);

    // Amenities filter (must match all checked amenities)
    if (selectedAmenities.length > 0) {
      list = list.filter(d => {
        const deskAmenities = (d.amenities || '').split(',').map(a => a.trim().toLowerCase());
        return selectedAmenities.every(req => deskAmenities.includes(req.toLowerCase()));
      });
    }

    // Verified only filter (only available active desks)
    if (verifiedOnly) {
      list = list.filter(d => d.is_active === 'available');
    }

    // Sorting
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.base_price - b.base_price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.base_price - a.base_price);
    } else if (sortBy === 'name-asc') {
      list.sort((a, b) => a.desk_id.localeCompare(b.desk_id));
    }

    return list;
  }, [rawDesks, searchQuery, selectedCity, maxPrice, selectedAmenities, verifiedOnly, sortBy]);

  const displayedDesks = filteredDesks.slice(0, visibleCount);

  /* ── Sidebar Filters Component (reused desktop/mobile) ── */
  const renderFiltersContent = () => (
    <div className="space-y-6">
      {/* Header + Clear */}
      <div className="flex items-center justify-between pb-3 border-b border-[#e2e8f0]">
        <div className="flex items-center gap-2 font-semibold text-[#0f172a]">
          <Sliders size={16} className="text-[#3b82f6]" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#eff6ff] text-[#2563eb]">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-xs font-medium text-[#3b82f6] hover:underline cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {/* City / Location */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-2.5">
          City / Hub
        </label>
        <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
          {availableCities.map(city => {
            const isActive = selectedCity.toLowerCase() === city.toLowerCase();
            return (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  setVisibleCount(9);
                }}
                className={[
                  'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer text-left',
                  isActive
                    ? 'bg-[#eff6ff] text-[#2563eb] font-semibold'
                    : 'text-[#334155] hover:bg-[#f8fafc]'
                ].join(' ')}
              >
                <span>{city}</span>
                {isActive && <Check size={14} className="text-[#2563eb]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Price Slider */}
      <div className="pt-3 border-t border-[#e2e8f0]">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-[#64748b]">
            Max Price
          </label>
          <span className="text-sm font-bold text-[#0f172a]">₹{maxPrice}/session</span>
        </div>
        <input
          type="range"
          min={80}
          max={350}
          step={10}
          value={maxPrice}
          onChange={e => {
            setMaxPrice(Number(e.target.value));
            setVisibleCount(9);
          }}
          className="w-full accent-[#3b82f6] cursor-pointer"
        />
        <div className="flex justify-between text-[11px] text-[#94a3b8] mt-1">
          <span>₹80</span>
          <span>₹350+</span>
        </div>
      </div>

      {/* Verified Only Toggle */}
      <div className="pt-3 border-t border-[#e2e8f0]">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-sm font-medium text-[#334155] flex items-center gap-1.5">
            <ShieldCheck size={16} className="text-[#16a34a]" />
            Verified only
          </span>
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={e => {
              setVerifiedOnly(e.target.checked);
              setVisibleCount(9);
            }}
            className="w-4 h-4 rounded text-[#3b82f6] focus:ring-[#3b82f6] cursor-pointer accent-[#3b82f6]"
          />
        </label>
      </div>

      {/* Amenities List */}
      <div className="pt-3 border-t border-[#e2e8f0]">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-2.5">
          Amenities
        </label>
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {derivedAmenities.map(([name, count]) => {
            const isChecked = selectedAmenities.includes(name);
            return (
              <label
                key={name}
                className="flex items-center justify-between text-sm text-[#334155] cursor-pointer hover:text-[#0f172a]"
              >
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleAmenity(name)}
                    className="w-4 h-4 rounded border-[#cbd5e1] accent-[#3b82f6] cursor-pointer"
                  />
                  <span>{name}</span>
                </div>
                <span className="text-xs text-[#94a3b8]">({count})</span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8fafc] min-h-screen py-8">
      <div className="container-nd">
        
        {/* ── Page Header + Search Bar ── */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-3xl font-bold text-[#0f172a]">Browse Workspaces</h1>
              <p className="text-sm text-[#64748b] mt-1">
                Explore real-time desks with instant QR verification and ML pricing
              </p>
            </div>

            {/* Mobile Filter Button */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Filter size={15} />}
                onClick={() => setMobileFilterOpen(true)}
              >
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </div>
          </div>

          {/* Search box & Active chips */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative flex-1 max-w-xl">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search by desk ID, city, or amenity (e.g. DESK-BLR, Koramangala, Standing Desk)..."
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(9);
                }}
                className="w-full bg-white pl-10 pr-10 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#eff6ff] shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#475569] cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs font-medium text-[#64748b] hidden sm:inline">Sort by:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-white border border-[#e2e8f0] rounded-xl px-3.5 py-2.5 text-sm font-medium text-[#334155] focus:outline-none focus:border-[#3b82f6] cursor-pointer pr-8 appearance-none shadow-xs"
                >
                  <option value="recommended">Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Desk ID (A-Z)</option>
                </select>
                <ArrowUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs font-medium text-[#64748b]">Active filters:</span>
              {selectedCity !== 'All' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff6ff] text-[#2563eb] text-xs font-medium border border-[#bfdbfe]">
                  City: {selectedCity}
                  <button onClick={() => setSelectedCity('All')} className="hover:text-[#1d4ed8]">
                    <X size={13} />
                  </button>
                </span>
              )}
              {maxPrice < 350 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#eff6ff] text-[#2563eb] text-xs font-medium border border-[#bfdbfe]">
                  Max ₹{maxPrice}
                  <button onClick={() => setMaxPrice(350)} className="hover:text-[#1d4ed8]">
                    <X size={13} />
                  </button>
                </span>
              )}
              {verifiedOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dcfce7] text-[#15803d] text-xs font-medium border border-[#bbf7d0]">
                  Verified Only
                  <button onClick={() => setVerifiedOnly(false)} className="hover:text-[#146c33]">
                    <X size={13} />
                  </button>
                </span>
              )}
              {selectedAmenities.map(am => (
                <span
                  key={am}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#334155] text-xs font-medium border border-[#e2e8f0]"
                >
                  {am}
                  <button onClick={() => toggleAmenity(am)} className="hover:text-[#0f172a]">
                    <X size={13} />
                  </button>
                </span>
              ))}
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-[#64748b] hover:text-[#0f172a] underline ml-1 cursor-pointer"
              >
                Reset all
              </button>
            </div>
          )}
        </div>

        {/* ── Error Banner (if API fetch warned) ── */}
        {error && (
          <div className="mb-6 p-4 rounded-xl border border-[#fde68a] bg-[#fffbeb] flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-[#d97706] flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#92400e]">Showing Demo Workspaces</p>
                <p className="text-xs text-[#b45309]">
                  {error} — displaying cached verified workspace inventory.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<RefreshCw size={13} />}
              onClick={fetchDesks}
            >
              Retry
            </Button>
          </div>
        )}

        {/* ── Main Layout: Sidebar (Desktop) + Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5 sticky top-24 shadow-xs">
              {renderFiltersContent()}
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3">
            {/* Top Results Count Bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-medium text-[#475569]">
                {loading ? (
                  <span>Searching workspaces...</span>
                ) : (
                  <span>
                    Showing <strong className="text-[#0f172a]">{displayedDesks.length}</strong> of{' '}
                    <strong className="text-[#0f172a]">{filteredDesks.length}</strong> desks found
                  </span>
                )}
              </p>
            </div>

            {/* Skeleton Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl border border-[#e2e8f0] h-80 animate-pulse p-4 flex flex-col justify-between"
                  >
                    <div className="w-full h-40 bg-[#f1f5f9] rounded-lg" />
                    <div className="space-y-2 mt-3">
                      <div className="h-4 bg-[#e2e8f0] rounded w-2/3" />
                      <div className="h-3 bg-[#f1f5f9] rounded w-1/2" />
                    </div>
                    <div className="h-9 bg-[#f1f5f9] rounded-xl mt-4" />
                  </div>
                ))}
              </div>
            ) : filteredDesks.length === 0 ? (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center max-w-lg mx-auto my-6">
                <div className="w-16 h-16 rounded-full bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center mx-auto mb-4">
                  <Search size={28} />
                </div>
                <h3 className="text-lg font-bold text-[#0f172a] mb-1">
                  No desks match your filters
                </h3>
                <p className="text-sm text-[#64748b] mb-6">
                  Try adjusting your selected city, price range, or amenities to see more workspace availability.
                </p>
                <Button onClick={clearFilters} size="md">
                  Clear all filters
                </Button>
              </div>
            ) : (
              /* Desks Grid */
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-in">
                  {displayedDesks.map((desk, i) => (
                    <SpaceCard
                      key={desk.id}
                      desk={desk}
                      image={DESK_IMAGES[i % DESK_IMAGES.length]}
                      rating={+(4.3 + ((desk.id * 7) % 6) * 0.1).toFixed(1)}
                      reviewCount={15 + ((desk.id * 11) % 40)}
                      onBook={() => navigate(`/space/${desk.id}`)}
                    />
                  ))}
                </div>

                {/* Pagination / Load More */}
                {visibleCount < filteredDesks.length && (
                  <div className="mt-10 text-center">
                    <p className="text-xs text-[#64748b] mb-3">
                      Showing {displayedDesks.length} of {filteredDesks.length} desks
                    </p>
                    <Button
                      variant="secondary"
                      size="lg"
                      onClick={() => setVisibleCount(prev => prev + 6)}
                    >
                      Load More Desks
                    </Button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── Mobile Filters Drawer / Modal ── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileFilterOpen(false)}
          />
          {/* Drawer Sheet */}
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden">
            <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between">
              <h3 className="font-bold text-[#0f172a] text-lg">Filters</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded-lg text-[#64748b] hover:bg-[#f1f5f9]"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              {renderFiltersContent()}
            </div>
            <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex gap-3">
              <Button
                variant="secondary"
                fullWidth
                onClick={clearFilters}
              >
                Clear
              </Button>
              <Button
                fullWidth
                onClick={() => setMobileFilterOpen(false)}
              >
                Show {filteredDesks.length} desks
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
