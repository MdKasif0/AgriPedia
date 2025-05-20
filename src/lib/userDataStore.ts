
'use client';

const FAVORITES_KEY = 'agripedia-favorites';
const RECENT_SEARCHES_KEY = 'agripedia-recent-searches';
const RECENT_VIEWS_KEY = 'agripedia-recent-views';
const MAX_RECENT_SEARCHES = 5;
const MAX_RECENT_VIEWS = 10; // Store more than 5 to make scrolling meaningful

// --- Favorites ---

export function getFavoriteIds(): string[] {
  if (typeof window === 'undefined') return [];
  const storedFavorites = localStorage.getItem(FAVORITES_KEY);
  return storedFavorites ? JSON.parse(storedFavorites) : [];
}

export function addFavorite(produceId: string): void {
  if (typeof window === 'undefined') return;
  const favorites = getFavoriteIds();
  if (!favorites.includes(produceId)) {
    favorites.push(produceId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export function removeFavorite(produceId: string): void {
  if (typeof window === 'undefined') return;
  let favorites = getFavoriteIds();
  favorites = favorites.filter(id => id !== produceId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function isFavorite(produceId: string): boolean {
  if (typeof window === 'undefined') return false;
  const favorites = getFavoriteIds();
  return favorites.includes(produceId);
}

// --- Recent Searches (Text Terms) ---

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  const storedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
  return storedSearches ? JSON.parse(storedSearches) : [];
}

export function addRecentSearch(query: string): void {
  if (typeof window === 'undefined' || !query.trim()) return;
  let searches = getRecentSearches();
  // Remove existing instance of the query to move it to the front
  searches = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
  // Add new query to the beginning
  searches.unshift(query);
  // Limit the number of recent searches
  searches = searches.slice(0, MAX_RECENT_SEARCHES);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

// --- Recently Viewed Produce Items ---

export function getRecentViewIds(): string[] {
  if (typeof window === 'undefined') return [];
  const storedViews = localStorage.getItem(RECENT_VIEWS_KEY);
  return storedViews ? JSON.parse(storedViews) : [];
}

export function addRecentView(produceId: string): void {
  if (typeof window === 'undefined' || !produceId) return;
  let views = getRecentViewIds();
  // Remove existing instance of the produceId to move it to the front
  views = views.filter(id => id !== produceId);
  // Add new produceId to the beginning
  views.unshift(produceId);
  // Limit the number of recent views
  views = views.slice(0, MAX_RECENT_VIEWS);
  localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(views));
}

export function clearRecentViews(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECENT_VIEWS_KEY);
}
