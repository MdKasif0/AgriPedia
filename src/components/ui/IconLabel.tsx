import type { LucideProps } from 'lucide-react';
import type { ElementType, ReactNode } from 'react';

interface IconLabelProps {
  icon: ElementType<LucideProps>;
  label: string;
  children: ReactNode;
  className?: string;
}

export default function IconLabel({ icon: Icon, label, children, className }: IconLabelProps) {
  return (
    <div className={`flex flex-col gap-3 p-4 bg-card rounded-xl shadow-lg ${className}`}>
      <div className="flex items-center gap-2 text-foreground">
        <Icon size={22} aria-hidden="true" className="text-primary" />
        <h3 className="text-lg font-semibold">{label}</h3>
      </div>
      <div className="text-sm text-card-foreground/90 pl-1">
        {children}
      </div>
    </div>
  );
}
