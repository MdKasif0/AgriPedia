'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/theme';
import { usePlatform } from '@/hooks/use-platform';
import { styles } from '@/lib/theme';
import { PlatformButton } from './platform-button';

interface PlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  fullScreen?: boolean;
}

export function PlatformModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  showCloseButton = true,
  fullScreen = false,
}: PlatformModalProps) {
  const { platform, isIOS, isAndroid } = usePlatform();
  const { getPlatformAnimation, getGestureProps } = usePlatformGestures();

  const platformSpecificStyles = {
    mobile: {
      container: fullScreen ? 'inset-0' : 'inset-x-0 bottom-0',
      modal: fullScreen ? 'rounded-none' : 'rounded-t-2xl',
      header: 'p-4',
      content: 'p-4',
      footer: 'p-4'
    },
    desktop: {
      container: 'inset-0',
      modal: 'rounded-xl max-w-lg mx-auto',
      header: 'p-6',
      content: 'p-6',
      footer: 'p-6'
    }
  };

  const animation = getPlatformAnimation('modal');
  const gestureProps = getGestureProps('modal');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={cn(
              'fixed bg-background shadow-lg',
              platformSpecificStyles[platform].container,
              platformSpecificStyles[platform].modal,
              className
            )}
            onClick={(e) => e.stopPropagation()}
            {...animation}
            {...gestureProps}
          >
            {(title || showCloseButton) && (
              <div
                className={cn(
                  'flex items-center justify-between border-b',
                  platformSpecificStyles[platform].header
                )}
              >
                {title && (
                  <div>
                    <h2 className="text-lg font-semibold">{title}</h2>
                    {description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {description}
                      </p>
                    )}
                  </div>
                )}
                {showCloseButton && (
                  <PlatformButton
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="ml-auto"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                  </PlatformButton>
                )}
              </div>
            )}
            <div className={platformSpecificStyles[platform].content}>
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Platform-specific modal variants
export function FullScreenModal(props: Omit<PlatformModalProps, 'fullScreen'>) {
  return <PlatformModal {...props} fullScreen />;
}

export function BottomSheetModal(props: Omit<PlatformModalProps, 'fullScreen'>) {
  return <PlatformModal {...props} fullScreen={false} />;
}

export function CenterModal(props: Omit<PlatformModalProps, 'fullScreen'>) {
  return <PlatformModal {...props} fullScreen={false} />;
}

// Modal sections
export function ModalHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    />
  );
}

export function ModalFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
      {...props}
    />
  );
}

export function ModalTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

export function ModalDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export function ModalContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('relative flex-auto', className)}
      {...props}
    />
  );
} 