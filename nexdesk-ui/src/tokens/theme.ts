/**
 * NexDesk Design Tokens — TypeScript mirror of CSS theme
 * Use these for dynamic styles, className builders, or
 * any place where you can't use a Tailwind utility class.
 */

export const colors = {
  primary: {
    50:  '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // brand primary
    600: '#2563eb',  // hover state
    700: '#1d4ed8',  // active/pressed
    800: '#1e40af',
    900: '#1e3a8a',
  },
  neutral: {
    50:  '#f8fafc',  // page background
    100: '#f1f5f9',  // section background
    200: '#e2e8f0',  // border / dividers
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',  // secondary text
    600: '#475569',  // body text
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',  // headings
  },
  success: {
    50:  '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50:  '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50:  '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
} as const;

export const spacing = {
  1:  '4px',
  2:  '8px',
  3:  '12px',
  4:  '16px',
  5:  '20px',
  6:  '24px',
  8:  '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const radius = {
  sm:   '6px',
  md:   '8px',
  lg:   '12px',  // primary — cards, buttons, inputs
  xl:   '16px',
  full: '9999px',
} as const;

export const typeScale = {
  xs:   '0.75rem',   // 12px — captions
  sm:   '0.875rem',  // 14px — labels
  base: '1rem',      // 16px — body
  lg:   '1.125rem',  // 18px — card titles
  xl:   '1.25rem',   // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '2rem',     // 32px — section H2
  '4xl': '2.75rem',  // 44px — hero H1
  '5xl': '3.5rem',   // 56px — hero H1 large
} as const;

/**
 * Resource category registry.
 * Only "desk" is backed by the API now.
 * Add "meeting_room" | "equipment" here when the backend supports them — 
 * no other changes needed in the component layer.
 */
export type ResourceCategory = 'desk' /* | 'meeting_room' | 'equipment' */;

export const categoryMeta: Record<ResourceCategory, { label: string; icon: string }> = {
  desk: { label: 'Hot Desks', icon: 'Monitor' },
  // meeting_room: { label: 'Meeting Rooms', icon: 'Users' },
  // equipment:    { label: 'Equipment',     icon: 'Wrench' },
};
