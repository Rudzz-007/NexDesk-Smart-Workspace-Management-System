import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Building2, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { type DeskData } from '@/components/ui/SpaceCard';
import { useAuth } from '@/context/AuthContext';

interface CityInfo {
  name: string;
  region: string;
  image: string;
  description?: string;
}

const CITIES_INFO: CityInfo[] = [
  {
    name: 'Bangalore',
    region: 'Karnataka • Silicon Valley of India',
    image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&auto=format&fit=crop',
    description: 'Prime tech parks & startup hubs across Koramangala, HSR Layout, and Outer Ring Road.',
  },
  {
    name: 'Mumbai',
    region: 'Maharashtra • Financial Capital',
    image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=600&auto=format&fit=crop',
    description: 'Executive workspaces across BKC, Lower Parel, Powai, and Andheri tech corridors.',
  },
  {
    name: 'Delhi NCR',
    region: 'National Capital Region',
    image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&auto=format&fit=crop',
    description: 'Corporate suites across Gurgaon Cyber City, Noida Sector 62, and South Delhi.',
  },
  {
    name: 'Hyderabad',
    region: 'Telangana • HITEC City Corridor',
    image: 'https://images.unsplash.com/photo-1626014903706-5382b451c861?w=600&auto=format&fit=crop',
    description: 'Modern hot desks across HITEC City, Gachibowli, and Jubilee Hills IT districts.',
  },
  {
    name: 'Pune',
    region: 'Maharashtra • Oxford of the East',
    image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=600&auto=format&fit=crop',
    description: 'Vibrant coworking environments in Hinjewadi, Baner, Viman Nagar, and Kalyani Nagar.',
  },
  {
    name: 'Chennai',
    region: 'Tamil Nadu • SaaS Capital',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&auto=format&fit=crop',
    description: 'High-speed workspaces along OMR IT Corridor, Guindy, and T. Nagar.',
  },
  {
    name: 'Kolkata',
    region: 'West Bengal • Cultural & Tech Hub',
    image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=600&auto=format&fit=crop',
    description: 'Collaborative workspaces across Salt Lake Sector V and New Town tech corridors.',
  },
  {
    name: 'Ahmedabad',
    region: 'Gujarat • GIFT City & Commerce Corridor',
    image: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop',
    description: 'Emerging financial & corporate centers across SG Highway and Satellite.',
  },
  {
    name: 'Jaipur',
    region: 'Rajasthan • Pink City Corridor',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=600&auto=format&fit=crop',
    description: 'Creative and entrepreneurial workspaces across Malviya Nagar and C-Scheme.',
  },
  {
    name: 'Kochi',
    region: 'Kerala • SmartCity & Infopark',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=600&auto=format&fit=crop',
    description: 'Tech hubs overlooking waterways and IT campuses in Kakkanad.',
  },
  {
    name: 'Chandigarh',
    region: 'Punjab & Haryana • IT Park Corridor',
    image: 'https://images.unsplash.com/photo-1588096344356-55998a1a36ac?w=600&auto=format&fit=crop',
    description: 'Structured, planned workspace environments in Rajiv Gandhi Chandigarh IT Park.',
  },
  {
    name: 'Indore',
    region: 'Madhya Pradesh • Super Corridor Hub',
    image: 'https://images.unsplash.com/photo-1616886283031-3de7764dca67?w=600&auto=format&fit=crop',
    description: 'Fast-growing commercial centers across Vijay Nagar and Super Corridor.',
  },
];

/* ─── High-quality fallback desks for unauthenticated / demo mode matching BrowsePage ──── */
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

export default function CitiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [rawDesks, setRawDesks] = useState<DeskData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const headers: Record<string, string> = {};
    if (user?.access_token) {
      headers['Authorization'] = `Bearer ${user.access_token}`;
    }

    fetch('http://127.0.0.1:8000/desks/', { headers })
      .then(async r => {
        if (r.ok) {
          const data = await r.json();
          const list: DeskData[] = Array.isArray(data) ? data : (data.desks ?? []);
          setRawDesks(list);
        } else {
          setRawDesks(FALLBACK_DESKS);
        }
      })
      .catch(() => setRawDesks(FALLBACK_DESKS))
      .finally(() => setLoading(false));
  }, [user?.access_token]);

  /* Calculate desk count per city client-side */
  const cityDeskCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const city of CITIES_INFO) {
      const q = city.name.toLowerCase();
      const count = rawDesks.filter(d => 
        d.location && d.location.toLowerCase().includes(q)
      ).length;
      counts[city.name] = count;
    }
    return counts;
  }, [rawDesks]);

  return (
    <div className="bg-[#f8fafc] min-h-screen pb-20">
      {/* ─── Hero Section ─── */}
      <section className="bg-gradient-to-br from-[#eff6ff] via-white to-[#f8fafc] border-b border-[#e2e8f0] py-16 sm:py-24 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#3b82f6]/10 text-[#2563eb] text-xs font-semibold uppercase tracking-wider mb-4">
            <MapPin size={13} />
            Nationwide Network
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0f172a] tracking-tight leading-tight">
            NexDesk is available <span className="text-[#3b82f6]">across India</span>
          </h1>
          <p className="text-base sm:text-lg text-[#64748b] mt-4 max-w-2xl mx-auto font-medium">
            Explore verified hot desks across prime tech corridors, business districts, and emerging startup hubs. Real-time availability, dynamic pricing, and instant QR check-in.
          </p>
        </div>
      </section>

      {/* ─── Cities Grid Section ─── */}
      <section className="container-nd py-16 px-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 pb-6 border-b border-[#e2e8f0]">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f172a]">12 Cities across India</h2>
            <p className="text-sm text-[#64748b] mt-1">Select a city to filter our live desk inventory.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#64748b]">
            <ShieldCheck size={16} className="text-[#22c55e]" />
            All spaces verified & backed by 30-min auto-release watchdog
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#e2e8f0] rounded-2xl h-80 animate-pulse p-4 flex flex-col justify-between">
                <div className="w-full h-44 bg-slate-100 rounded-xl mb-4" />
                <div className="h-6 bg-slate-100 rounded-md w-1/2 mb-2" />
                <div className="h-4 bg-slate-100 rounded-md w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CITIES_INFO.map((city) => {
              const count = cityDeskCounts[city.name] || 0;
              return (
                <Link
                  key={city.name}
                  to={`/browse?city=${encodeURIComponent(city.name)}`}
                  className="bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-[#3b82f6] transition-all duration-200 flex flex-col group cursor-pointer"
                >
                  {/* Card Header / Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={city.image}
                      alt={`${city.name} workspace`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    
                    {/* Badge placement */}
                    <div className="absolute top-3.5 right-3.5 z-10">
                      {count > 0 ? (
                        <Badge variant="available" dot className="bg-white/95 backdrop-blur-md shadow-xs font-bold">
                          {count} {count === 1 ? 'desk' : 'desks'} available
                        </Badge>
                      ) : (
                        <Badge variant="category" className="bg-white/95 backdrop-blur-md text-[#475569] shadow-xs font-bold">
                          Coming soon
                        </Badge>
                      )}
                    </div>

                    <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 text-white">
                      <h3 className="text-xl font-black tracking-tight flex items-center justify-between">
                        <span>{city.name}</span>
                        <ArrowRight size={18} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#3b82f6] bg-white rounded-full p-0.5" />
                      </h3>
                      <p className="text-xs text-slate-200 font-medium mt-0.5 truncate">
                        {city.region}
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between bg-white">
                    <p className="text-xs sm:text-sm text-[#64748b] leading-relaxed">
                      {city.description || `On-demand hot desks, meeting tables, and private focus rooms across prime tech hubs in ${city.name}.`}
                    </p>

                    <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex items-center justify-between text-xs font-bold text-[#3b82f6] group-hover:text-[#2563eb]">
                      <span>Explore {city.name} desks</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  );
}
