
'use client';

const FAVORITES_KEY = 'agripedia-favorites';
const RECENT_SEARCHES_KEY = 'agripedia-recent-searches';
const GEMINI_API_KEY_STORAGE_KEY = 'agripedia-gemini-api-key'; // Added

const MAX_RECENT_SEARCHES = 5;

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
  // Remove previous instance of the same query to move it to the top
  searches = searches.filter(s => s.toLowerCase() !== query.toLowerCase());
  searches.unshift(query);
  searches = searches.slice(0, MAX_RECENT_SEARCHES);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

// --- Gemini API Key ---
export function setGeminiApiKey(apiKey: string): void {
  if (typeof window === 'undefined') return;
  if (apiKey.trim() === '') {
    localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
  } else {
    localStorage.setItem(GEMINI_API_KEY_STORAGE_KEY, apiKey);
  }
}

export function getGeminiApiKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(GEMINI_API_KEY_STORAGE_KEY);
}

export function removeGeminiApiKey(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GEMINI_API_KEY_STORAGE_KEY);
}

// --- User Mode ---
import { type UserModeId, DEFAULT_USER_MODE_ID } from './constants'; // Assuming constants.ts is in the same directory

const USER_MODE_KEY = 'agripedia-user-mode';

export function getCurrentUserMode(): UserModeId {
  if (typeof window === 'undefined') return DEFAULT_USER_MODE_ID;
  const storedMode = localStorage.getItem(USER_MODE_KEY) as UserModeId | null;
  return storedMode || DEFAULT_USER_MODE_ID;
}

export function setCurrentUserMode(modeId: UserModeId): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_MODE_KEY, modeId);
  // Dispatch a custom event to notify other components of the change
  window.dispatchEvent(new CustomEvent('userModeChanged', { detail: { modeId } }));
}

// --- Personalized Grow Planner Data ---

export interface StoredPlannerData {
  userId: string;
  location: {
    manualAddress?: string;
    lat?: number;
    lon?: number;
    climateZone?: string;
  };
  space: 'indoor' | 'balcony' | 'small_yard' | 'large_garden' | 'greenhouse' | '';
  spaceDimensions?: { width?: number; length?: number }; // Storing as numbers
  sunlight: 'low' | 'partial' | 'full' | '';
  purpose: string[];
  experience: 'beginner' | 'intermediate' | 'advanced' | '';
  timeCommitment: number; // Storing the raw value (0-100)
  createdAt: string; // ISO date string
}

const PLANNER_DATA_KEY = 'agripedia-planner-data';

export const setPlannerData = (data: StoredPlannerData): void => {
  if (typeof window === 'undefined') {
    console.warn("localStorage is not available. Planner data not saved.");
    return;
  }
  try {
    localStorage.setItem(PLANNER_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving planner data to localStorage:", error);
  }
};

export const getPlannerData = (): StoredPlannerData | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const dataString = localStorage.getItem(PLANNER_DATA_KEY);
    if (dataString) {
      return JSON.parse(dataString) as StoredPlannerData;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving planner data from localStorage:", error);
    return null;
  }
};
