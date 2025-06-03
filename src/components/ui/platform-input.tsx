'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/theme';
import { usePlatform } from '@/hooks/use-platform';
import { styles } from '@/lib/theme';

export interface PlatformInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const PlatformInput = React.forwardRef<HTMLInputElement, PlatformInputProps>(
  ({ className, label, error, leftIcon, rightIcon, type, ...props }, ref) => {
    const { platform, isIOS, isAndroid } = usePlatform();
    const { getPlatformAnimation } = usePlatformGestures();
    const [isFocused, setIsFocused] = React.useState(false);

    const platformSpecificStyles = {
      mobile: {
        container: 'rounded-2xl',
        input: 'text-base',
        label: 'text-base'
      },
      desktop: {
        container: 'rounded-md',
        input: 'text-sm',
        label: 'text-sm'
      }
    };

    const animation = getPlatformAnimation('fade');

    return (
      <div className="space-y-2">
        {label && (
          <label
            className={cn(
              'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
              platformSpecificStyles[platform].label
            )}
          >
            {label}
          </label>
        )}
        <motion.div
          className={cn(
            'relative flex items-center',
            platformSpecificStyles[platform].container
          )}
          {...animation}
        >
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              platformSpecificStyles[platform].input,
              {
                'pl-10': leftIcon,
                'pr-10': rightIcon,
                'border-destructive': error,
                'border-primary': isFocused && !error,
              },
              className
            )}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none">
              {rightIcon}
            </div>
          )}
        </motion.div>
        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

PlatformInput.displayName = 'PlatformInput';

// Platform-specific input variants
export const SearchInput = React.forwardRef<
  HTMLInputElement,
  Omit<PlatformInputProps, 'type'>
>((props, ref) => (
  <PlatformInput
    ref={ref}
    type="search"
    leftIcon={
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted-foreground"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
    }
    {...props}
  />
));

SearchInput.displayName = 'SearchInput';

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<PlatformInputProps, 'type'>
>((props, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <PlatformInput
      ref={ref}
      type={showPassword ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-muted-foreground hover:text-foreground"
        >
          {showPassword ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" x2="22" y1="2" y2="22" />
            </svg>
          )}
        </button>
      }
      {...props}
    />
  );
});

PasswordInput.displayName = 'PasswordInput';

export const NumberInput = React.forwardRef<
  HTMLInputElement,
  Omit<PlatformInputProps, 'type'>
>((props, ref) => (
  <PlatformInput
    ref={ref}
    type="number"
    inputMode="numeric"
    pattern="[0-9]*"
    {...props}
  />
));

NumberInput.displayName = 'NumberInput';

export const EmailInput = React.forwardRef<
  HTMLInputElement,
  Omit<PlatformInputProps, 'type'>
>((props, ref) => (
  <PlatformInput
    ref={ref}
    type="email"
    inputMode="email"
    autoComplete="email"
    {...props}
  />
));

EmailInput.displayName = 'EmailInput'; 