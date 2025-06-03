'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/theme';
import { usePlatform } from '@/hooks/use-platform';
import { styles } from '@/lib/theme';

interface PlatformCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  interactive?: boolean;
  onClick?: () => void;
}

export const PlatformCard = forwardRef<HTMLDivElement, PlatformCardProps>(
  ({ children, className, variant = 'default', interactive = false, onClick, ...props }, ref) => {
    const { platform, isIOS, isAndroid } = usePlatform();
    const { getPlatformAnimation } = usePlatformGestures();

    const baseStyles = cn(
      'relative overflow-hidden transition-all duration-200',
      styles[platform].card,
      {
        'cursor-pointer': interactive,
        'hover:shadow-md': interactive && platform === 'desktop',
        'active:scale-[0.98]': interactive && platform === 'mobile',
        'bg-card': variant === 'default',
        'bg-card shadow-md': variant === 'elevated',
        'bg-transparent border': variant === 'outlined',
      },
      className
    );

    const platformSpecificStyles = {
      mobile: {
        default: 'rounded-2xl',
        elevated: 'shadow-lg',
        outlined: 'border-2'
      },
      desktop: {
        default: 'rounded-xl',
        elevated: 'shadow-md',
        outlined: 'border'
      }
    };

    const animation = getPlatformAnimation('fade');

    const Card = motion.div;

    return (
      <Card
        ref={ref}
        className={cn(baseStyles, platformSpecificStyles[platform][variant])}
        onClick={onClick}
        whileTap={interactive ? { scale: 0.98 } : undefined}
        {...animation}
        {...props}
      >
        {children}
      </Card>
    );
  }
);

PlatformCard.displayName = 'PlatformCard';

// Platform-specific card variants
export const ElevatedCard = forwardRef<HTMLDivElement, Omit<PlatformCardProps, 'variant'>>(
  (props, ref) => <PlatformCard ref={ref} variant="elevated" {...props} />
);

ElevatedCard.displayName = 'ElevatedCard';

export const OutlinedCard = forwardRef<HTMLDivElement, Omit<PlatformCardProps, 'variant'>>(
  (props, ref) => <PlatformCard ref={ref} variant="outlined" {...props} />
);

OutlinedCard.displayName = 'OutlinedCard';

// Platform-specific card sections
export const CardHeader = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));

CardTitle.displayName = 'CardTitle';

export const CardDescription = forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));

CardDescription.displayName = 'CardDescription';

export const CardContent = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));

CardContent.displayName = 'CardContent';

export const CardFooter = forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter'; 