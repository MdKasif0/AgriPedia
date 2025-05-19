// src/components/home/InfoBanner.tsx
import type { LucideProps } from 'lucide-react';
import type { ElementType } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface InfoBannerProps {
  icon: ElementType<LucideProps>;
  title: string;
  description: string;
  className?: string;
}

export default function InfoBanner({ icon: Icon, title, description, className }: InfoBannerProps) {
  return (
    <Card className={`bg-primary text-primary-foreground p-4 rounded-2xl shadow-lg ${className}`}>
      <CardContent className="flex items-center gap-4 p-0">
        {Icon && <Icon size={32} className="shrink-0" />}
        <div className="flex flex-col">
          <h3 className="text-md font-semibold">{title}</h3>
          <p className="text-sm opacity-90">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
