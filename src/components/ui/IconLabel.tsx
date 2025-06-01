import type { LucideProps } from 'lucide-react';
import type { ElementType, ReactNode } from 'react';
import { motion } from 'framer-motion'; // Added framer-motion
import { cn } from '@/lib/utils'; // Import cn for class merging

interface IconLabelProps {
  icon: ElementType<LucideProps>;
  label: string;
  children: ReactNode;
  className?: string;
}

export default function IconLabel({ icon: Icon, label, children, className }: IconLabelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn("flex flex-col gap-3 p-4 bg-card rounded-xl shadow-soft-lg", className)} // Used shadow-soft-lg and cn
    >
      <div className="flex items-center gap-2 text-foreground">
        <Icon size={22} aria-hidden="true" className="text-primary" />
        <h3 className="text-lg font-semibold">{label}</h3>
      </div>
      <div className="text-sm text-card-foreground/90 pl-1">
        {children}
      </div>
    </motion.div>
  );
}
