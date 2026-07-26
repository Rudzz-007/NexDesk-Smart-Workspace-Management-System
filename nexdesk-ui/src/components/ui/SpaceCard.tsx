import React from 'react';
import { MapPin, Star, ShieldCheck, Wifi, Monitor, Zap } from 'lucide-react';
import { Badge, AmenityPillList } from './Badge';

/* ── API shape from GET /desks/ ─────────────────────────────── */
export interface DeskData {
  id: number;
  desk_id: string;
  location: string;
  base_price: number;
  amenities?: string;          // comma-separated string from API
  is_active: 'available' | 'maintenance';
}

interface SpaceCardProps {
  desk: DeskData;
  image?: string;
  rating?: number;
  reviewCount?: number;
  zone?: string;
  onBook?: (desk: DeskData) => void;
  className?: string;
}

/* Fallback icon map for amenities (used in card quick-icons) */
const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi:     <Wifi size={13} />,
  monitor:  <Monitor size={13} />,
  power:    <Zap size={13} />,
};

function getAmenityIcon(label: string): React.ReactNode {
  const key = label.toLowerCase();
  return AMENITY_ICONS[key] ?? null;
}

export function SpaceCard({
  desk,
  image,
  rating = 4.5,
  reviewCount = 24,
  onBook,
  className = '',
}: SpaceCardProps) {
  const isAvailable = desk.is_active === 'available';
  const cardRef = React.useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (cardRef.current) observer.unobserve(cardRef.current);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <article
      ref={cardRef}
      onClick={() => onBook?.(desk)}
      className={[
        'group bg-white rounded-xl border border-[#e2e8f0] shadow-sm',
        'overflow-hidden flex flex-col cursor-pointer hover-lift',
        isVisible ? 'animate-fade-in-up' : 'opacity-0',
        className,
      ].join(' ')}
      aria-label={`Desk ${desk.desk_id} at ${desk.location}`}
    >
      {/* ── Image area ────────────────────────────────────────── */}
      <div className="relative w-full aspect-[16/10] bg-[#f1f5f9] overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={`${desk.location} workspace`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Monitor size={40} className="text-[#cbd5e1]" />
          </div>
        )}
        {/* Status badge overlay */}
        <div className="absolute top-3 left-3">
          {isAvailable ? (
            <Badge variant="verified" dot>
              <ShieldCheck size={11} />
              Verified
            </Badge>
          ) : (
            <Badge variant="unavailable" dot>Maintenance</Badge>
          )}
        </div>
        {/* Category tag */}
        <div className="absolute top-3 right-3">
          <Badge variant="category">Hot Desk</Badge>
        </div>
      </div>

      {/* ── Card body ─────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Title + Rating */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-[#0f172a] truncate">
              {desk.desk_id}
            </h3>
            <div className="flex items-center gap-1 mt-0.5 text-sm text-[#64748b]">
              <MapPin size={13} className="text-[#3b82f6] flex-shrink-0" />
              <span className="truncate">{desk.location}</span>
            </div>
          </div>
          {/* Rating */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star size={13} className="text-[#f59e0b] fill-[#f59e0b]" />
            <span className="text-sm font-medium text-[#334155]">{rating.toFixed(1)}</span>
            <span className="text-xs text-[#94a3b8]">({reviewCount})</span>
          </div>
        </div>

        {/* Amenity pills */}
        {desk.amenities && (
          <AmenityPillList amenities={desk.amenities} max={3} />
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#f1f5f9]">
          <div>
            <span className="text-lg font-bold text-[#0f172a]">
              ₹{desk.base_price.toFixed(0)}
            </span>
            <span className="text-xs text-[#94a3b8] ml-1">/ session</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook?.(desk);
            }}
            disabled={!isAvailable}
            id={`book-desk-${desk.desk_id}`}
            className={[
              'px-4 py-2 rounded-xl text-sm font-medium hover-lift',
              isAvailable
                ? 'bg-[#3b82f6] text-white hover:bg-[#2563eb] active:bg-[#1d4ed8] cursor-pointer'
                : 'bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed',
            ].join(' ')}
          >
            {isAvailable ? 'Book Now' : 'Unavailable'}
          </button>
        </div>
      </div>
    </article>
  );
}
