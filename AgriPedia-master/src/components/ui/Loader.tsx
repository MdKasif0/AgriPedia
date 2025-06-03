import { Loader2 } from 'lucide-react';

interface LoaderProps {
  size?: number;
  className?: string;
  text?: string;
}

export default function Loader({ size = 24, className, text }: LoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className}`}>
      <Loader2 size={size} className="animate-spin text-primary" />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );
}
