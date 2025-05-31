
'use client';

const FAVORITES_KEY = 'agripedia-favorites';
const RECENT_SEARCHES_KEY = 'agripedia-recent-searches';
const GEMINI_API_KEY_STORAGE_KEY = 'agripedia-gemini-api-key'; // Added
const AGRIPEDIA_USER_ID_KEY = 'agripedia-user-id';
const GROW_PLANNER_DATA_KEY = 'agripedia-grow-planner-data';

const MAX_RECENT_SEARCHES = 5;

// --- User ID ---
function generateSimpleUniqueId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getUserId(): string {
  if (typeof window === 'undefined') {
    // This should ideally not be called server-side if it's for client-specific data.
    // Returning a placeholder or handling it appropriately if server context is possible.
    return 'server-user-id-placeholder';
  }
  let userId = localStorage.getItem(AGRIPEDIA_USER_ID_KEY);
  if (!userId) {
    userId = generateSimpleUniqueId();
    localStorage.setItem(AGRIPEDIA_USER_ID_KEY, userId);
  }
  return userId;
}

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

// --- Grow Planner Data ---

interface GrowPlannerLocation {
  lat: number | null;
  lon: number | null;
  address: string;
  climateZone: string;
}

// This interface should mirror the formData structure in PersonalizedGrowPlanner.tsx
export interface GrowPlannerFormData {
  location: GrowPlannerLocation;
  growingSpace: string;
  spaceDimensions: { // Optional as per form implementation
    length: string;
    width: string;
    unit: string;
  };
  sunlight: string;
  purpose: string[];
  timeCommitment: string;
  experience: string;
}

export interface GrowPlannerData extends GrowPlannerFormData {
  userId: string;
  createdAt: string; // ISO string format
}

export function setGrowPlannerData(data: GrowPlannerFormData): void {
  if (typeof window === 'undefined') return;

  const userId = getUserId(); // Get or generate user ID
  const createdAt = new Date().toISOString();

  const fullData: GrowPlannerData = {
    ...data,
    userId,
    createdAt,
  };

  localStorage.setItem(GROW_PLANNER_DATA_KEY, JSON.stringify(fullData));
}

export function getGrowPlannerData(): GrowPlannerData | null {
  if (typeof window === 'undefined') return null;

  const dataString = localStorage.getItem(GROW_PLANNER_DATA_KEY);
  if (!dataString) {
    return null;
  }

  try {
    const data: GrowPlannerData = JSON.parse(dataString);
    // Basic validation to ensure it's somewhat like our expected structure
    if (data && data.location && typeof data.createdAt === 'string') {
      return data;
    }
    return null;
  } catch (error) {
    console.error("Error parsing grow planner data from localStorage:", error);
    return null;
  }
}

export function clearGrowPlannerData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GROW_PLANNER_DATA_KEY);
}
