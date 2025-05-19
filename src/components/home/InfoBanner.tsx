
// src/components/home/InfoBanner.tsx
import type { LucideProps } from 'lucide-react';
import type { ElementType } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface InfoBannerProps {
  icon: ElementType<LucideProps>;
  title: string;
  description: string;
  asideText?: {
    label: string;
    value: string;
  };
  className?: string;
}

export default function InfoBanner({ icon: Icon, title, description, asideText, className }: InfoBannerProps) {
  return (
    <Card className={`bg-primary text-primary-foreground p-4 rounded-xl shadow-md ${className}`}>
      <CardContent className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 sm:gap-4 p-0">
        <div className="flex items-center gap-3">
          {Icon && <Icon size={28} className="shrink-0" />}
          <div className="flex flex-col text-left">
            <h3 className="text-md font-semibold">{title}</h3>
            <p className="text-sm opacity-90">{description}</p>
          </div>
        </div>
        {asideText && (
          <div className="text-left sm:text-right mt-2 sm:mt-0 shrink-0">
            <p className="text-xs opacity-80">{asideText.label}</p>
            <p className="text-lg font-semibold">{asideText.value}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
