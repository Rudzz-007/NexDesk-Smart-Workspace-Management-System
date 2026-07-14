import React from 'react';
import { ChevronDown } from 'lucide-react';

/* ── Shared wrapper ───────────────────────────────────────────── */
interface FieldWrapperProps {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FieldWrapper({ label, error, hint, required, children, className = '' }: FieldWrapperProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-[#334155]">
          {label}
          {required && <span className="text-[#ef4444] ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-[#dc2626]">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[#64748b]">{hint}</p>
      ) : null}
    </div>
  );
}

/* ── Base input class ─────────────────────────────────────────── */
const BASE_INPUT =
  'w-full rounded-xl border border-[#e2e8f0] bg-white px-4 py-2.5 text-sm text-[#0f172a] ' +
  'placeholder:text-[#94a3b8] ' +
  'transition-colors duration-150 ' +
  'hover:border-[#94a3b8] ' +
  'focus:outline-none focus:border-[#3b82f6] focus:ring-2 focus:ring-[#bfdbfe] ' +
  'disabled:bg-[#f8fafc] disabled:cursor-not-allowed';

const ERROR_INPUT = 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[#fee2e2]';

/* ── Input ────────────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  wrapperClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  required,
  wrapperClassName,
  className = '',
  ...rest
}: InputProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-[#94a3b8] flex-shrink-0 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          {...rest}
          required={required}
          className={[
            BASE_INPUT,
            leftIcon  ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            error ? ERROR_INPUT : '',
            className,
          ].join(' ')}
        />
        {rightIcon && (
          <span className="absolute right-3 text-[#94a3b8] flex-shrink-0 pointer-events-none">
            {rightIcon}
          </span>
        )}
      </div>
    </FieldWrapper>
  );
}

/* ── Select ───────────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  wrapperClassName?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  hint,
  required,
  wrapperClassName,
  options,
  placeholder,
  className = '',
  ...rest
}: SelectProps) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required} className={wrapperClassName}>
      <div className="relative flex items-center">
        <select
          {...rest}
          required={required}
          className={[
            BASE_INPUT,
            'appearance-none pr-10 cursor-pointer',
            error ? ERROR_INPUT : '',
            className,
          ].join(' ')}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 text-[#94a3b8] pointer-events-none"
          aria-hidden="true"
        />
      </div>
    </FieldWrapper>
  );
}

/* ── LocationPicker ───────────────────────────────────────────── */
import { useState, useRef, useEffect } from 'react';
import { MapPin, Search, X } from 'lucide-react';

const INDIA_CITIES = [
  'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai',
  'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kochi',
  'Chandigarh', 'Indore', 'Bhopal', 'Nagpur', 'Noida', 'Gurugram',
];

interface LocationPickerProps {
  value?: string;
  onChange?: (city: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  wrapperClassName?: string;
}

export function LocationPicker({
  value = '',
  onChange,
  label,
  error,
  placeholder = 'Select city',
  wrapperClassName,
}: LocationPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = INDIA_CITIES.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function select(city: string) {
    onChange?.(city);
    setOpen(false);
    setQuery('');
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange?.('');
  }

  return (
    <FieldWrapper label={label} error={error} className={wrapperClassName}>
      <div ref={containerRef} className="relative">
        {/* Trigger button */}
        <button
          type="button"
          id="location-picker-trigger"
          onClick={() => setOpen((o) => !o)}
          className={[
            BASE_INPUT,
            'flex items-center gap-2 text-left cursor-pointer',
            error ? ERROR_INPUT : '',
            open ? 'border-[#3b82f6] ring-2 ring-[#bfdbfe]' : '',
          ].join(' ')}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <MapPin size={16} className="text-[#3b82f6] flex-shrink-0" />
          <span className={value ? 'text-[#0f172a]' : 'text-[#94a3b8]'}>
            {value || placeholder}
          </span>
          {value ? (
            <X
              size={14}
              className="ml-auto text-[#94a3b8] hover:text-[#475569]"
              onClick={clear}
              aria-label="Clear location"
            />
          ) : (
            <ChevronDown size={16} className="ml-auto text-[#94a3b8]" />
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div
            role="listbox"
            className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-[#e2e8f0] shadow-lg overflow-hidden"
          >
            {/* Search inside dropdown */}
            <div className="p-2 border-b border-[#f1f5f9]">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-2.5 text-[#94a3b8]" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search cities..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-[#e2e8f0] focus:outline-none focus:border-[#3b82f6]"
                />
              </div>
            </div>
            {/* City list */}
            <ul className="max-h-52 overflow-y-auto py-1">
              {filtered.length > 0 ? (
                filtered.map((city) => (
                  <li key={city}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={city === value}
                      onClick={() => select(city)}
                      className={[
                        'w-full text-left px-4 py-2 text-sm flex items-center gap-2',
                        'hover:bg-[#eff6ff] transition-colors duration-100',
                        city === value ? 'text-[#3b82f6] font-medium bg-[#eff6ff]' : 'text-[#334155]',
                      ].join(' ')}
                    >
                      <MapPin size={13} className="text-[#94a3b8] flex-shrink-0" />
                      {city}
                    </button>
                  </li>
                ))
              ) : (
                <li className="px-4 py-3 text-sm text-[#94a3b8] text-center">No cities found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </FieldWrapper>
  );
}
