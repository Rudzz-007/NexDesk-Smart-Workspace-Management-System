import React from 'react';

type BadgeVariant = 'verified' | 'available' | 'pending' | 'unavailable' | 'category' | 'noshow';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  verified:    'bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0]',
  available:   'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]',
  pending:     'bg-[#fef3c7] text-[#b45309] border border-[#fde68a]',
  unavailable: 'bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]',
  noshow:      'bg-[#fee2e2] text-[#b91c1c] border border-[#fecaca]',
  category:    'bg-[#f1f5f9] text-[#475569] border border-[#e2e8f0]',
};

const dotColors: Record<BadgeVariant, string> = {
  verified:    'bg-[#22c55e]',
  available:   'bg-[#3b82f6]',
  pending:     'bg-[#f59e0b]',
  unavailable: 'bg-[#ef4444]',
  noshow:      'bg-[#ef4444]',
  category:    'bg-[#94a3b8]',
};

export function Badge({ variant = 'available', children, className = '', dot = false }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className,
      ].join(' ')}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant]}`} aria-hidden="true" />
      )}
      {children}
    </span>
  );
}

/* ── Amenity Pill ───────────────────────────────────────────── */
interface AmenityPillProps {
  label: string;
  className?: string;
}

export function AmenityPill({ label, className = '' }: AmenityPillProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        'bg-[#f1f5f9] text-[#475569]',
        className,
      ].join(' ')}
    >
      {label.trim()}
    </span>
  );
}

/**
 * Utility: split the API's comma-separated amenities string into pills.
 * Use this anywhere you receive the raw `amenities` field from GET /desks/
 */
export function AmenityPillList({ amenities, max = 3 }: { amenities?: string; max?: number }) {
  if (!amenities) return null;
  const all = amenities.split(',').map((a) => a.trim()).filter(Boolean);
  const shown = all.slice(0, max);
  const extra = all.length - shown.length;

  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((a) => (
        <AmenityPill key={a} label={a} />
      ))}
      {extra > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-[#f1f5f9] text-[#94a3b8]">
          +{extra}
        </span>
      )}
    </div>
  );
}
