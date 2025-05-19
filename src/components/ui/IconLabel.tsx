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
    <div className={`flex flex-col gap-2 p-4 bg-card rounded-lg shadow ${className}`}>
      <div className="flex items-center gap-2 text-primary">
        <Icon size={20} aria-hidden="true" />
        <h3 className="text-md font-semibold">{label}</h3>
      </div>
      <div className="text-sm text-foreground pl-1">
        {children}
      </div>
    </div>
  );
}
