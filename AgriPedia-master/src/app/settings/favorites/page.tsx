'use client';

import { useState, useEffect, useCallback } from 'react';
import ProduceCard from '@/components/produce/ProduceCard';
import type { ProduceInfo } from '@/lib/produceData';
import { getAllProduce } from '@/lib/produceData';
import * as UserDataStore from '@/lib/userDataStore';
import { Heart, SearchX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
  const [favoriteItems, setFavoriteItems] = useState<ProduceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFavorites = useCallback(() => {
    setIsLoading(true);
    const favIds = UserDataStore.getFavoriteIds();
    const allProduce = getAllProduce();
    const currentFavorites = favIds
      .map(id => allProduce.find(p => p.id === id))
      .filter(Boolean) as ProduceInfo[];
    setFavoriteItems(currentFavorites);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadFavorites();
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'agripedia-favorites') {
        loadFavorites();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadFavorites]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="ml-3 text-muted-foreground">Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6">
      <header className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2 flex items-center justify-center gap-3">
          <Heart size={32} className="text-primary" /> My Favorite Produce
        </h1>
        <p className="text-muted-foreground">
          Your hand-picked collection of fruits and vegetables.
        </p>
      </header>

      {favoriteItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoriteItems.map(item => (
            <ProduceCard key={item.id} produce={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 flex flex-col items-center">
          <SearchX size={48} className="text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground mb-2">No favorites yet!</p>
          <p className="text-sm text-muted-foreground mb-6">
            Start exploring and add some produce to your favorites list.
          </p>
                  <Link href="/search">
            <Button variant="default">Explore Produce</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
