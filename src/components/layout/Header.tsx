
import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-background shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-primary hover:text-primary/90 transition-colors">
          <Leaf size={24} />
          <span className="text-foreground">AgriPedia</span>
        </Link>
        {/* Future navigation links can go here */}
      </div>
    </header>
  );
}
