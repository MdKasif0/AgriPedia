'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation'; // Corrected import for usePathname
import { ReactNode } from 'react';

interface PageTransitionWrapperProps {
  children: ReactNode;
}

const PageTransitionWrapper = ({ children }: PageTransitionWrapperProps) => {
  const pathname = usePathname();

  const variants = {
    initial: { opacity: 0, y: 15 }, // Start slightly down and faded out
    animate: { opacity: 1, y: 0 },  // Animate to full opacity and original position
    exit: { opacity: 0, y: -15 }, // Exit slightly up and faded out
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname} // AnimatePresence needs a unique key to track components
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={{ duration: 0.3, ease: 'easeInOut' }} // Adjusted duration and ease
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

export default PageTransitionWrapper;
