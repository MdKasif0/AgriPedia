
// src/components/home/InfoBanner.tsx
import type { LucideProps } from 'lucide-react';
import type { ElementType } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface InfoBannerProps {
  icon: ElementType<LucideProps>;
  title: string;
  description: string;
  asideText?: {
    label: string;
    value: string;
  };
  className?: string;
  iconProps?: LucideProps; // For passing props like className="animate-spin"
}

export default function InfoBanner({ icon: Icon, title, description, asideText, className, iconProps }: InfoBannerProps) {
  return (
    <Card className={`rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent ${className}`}>
      <CardHeader className="pb-2"> {/* Adjust padding as needed */}
        <div className="flex items-start gap-3">
          {Icon && <Icon size={24} className="shrink-0 text-primary mt-1 group-hover:animate-sprout origin-bottom transition-transform duration-300" {...iconProps} />} {/* Adjusted size and margin */}
          <div className="flex-grow">
            <CardTitle className="font-serif text-lg">{title}</CardTitle>
            {description && <CardDescription className="text-sm">{description}</CardDescription>}
          </div>
        </div>
      </CardHeader>
      {asideText && (
        <CardContent className="pt-0 pb-3"> {/* Adjust padding for aside text if present */}
          <div className="text-right"> {/* Align aside text to the right */}
            <p className="text-xs text-muted-foreground">{asideText.label}</p>
            <p className="text-lg font-semibold">{asideText.value}</p>
          </div>
        </CardContent>
      )}
      {/* If there's no asideText, but there was a description, ensure CardContent is used if needed for padding consistency, or remove if CardHeader's padding is sufficient. */}
      {/* This example assumes description is part of CardHeader with CardDescription. If description were meant to be main content, it'd go in CardContent. */}
    </Card>
  );
}
