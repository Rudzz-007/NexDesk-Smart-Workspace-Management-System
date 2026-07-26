import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize    = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#3b82f6] text-white border border-[#3b82f6] ' +
    'hover:bg-[#2563eb] hover:border-[#2563eb] ' +
    'active:bg-[#1d4ed8] active:border-[#1d4ed8] ' +
    'focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 ' +
    'disabled:bg-[#93c5fd] disabled:border-[#93c5fd] disabled:cursor-not-allowed',

  secondary:
    'bg-white text-[#3b82f6] border border-[#3b82f6] ' +
    'hover:bg-[#eff6ff] ' +
    'active:bg-[#dbeafe] ' +
    'focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 ' +
    'disabled:text-[#93c5fd] disabled:border-[#bfdbfe] disabled:cursor-not-allowed',

  ghost:
    'bg-transparent text-[#3b82f6] border border-transparent ' +
    'hover:bg-[#eff6ff] hover:border-[#eff6ff] ' +
    'active:bg-[#dbeafe] ' +
    'focus-visible:ring-2 focus-visible:ring-[#3b82f6] focus-visible:ring-offset-2 ' +
    'disabled:text-[#93c5fd] disabled:cursor-not-allowed',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 h-8',
  md: 'px-4 py-2   text-sm gap-2   h-10',
  lg: 'px-6 py-2.5 text-base gap-2 h-12',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium rounded-xl',
        'transition-all duration-150 cursor-pointer select-none hover-lift',
        'focus:outline-none',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
    >
      {loading ? (
        <svg
          className="animate-spin h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        leftIcon && <span className="flex-shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!loading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
    </button>
  );
}
