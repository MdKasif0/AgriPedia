
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

// --- Personalized Grow Planner Preferences ---

const GROW_PLANNER_PREFS_KEY = 'agripedia-grow-planner-prefs';

export interface GrowPlannerPrefs {
  location?: string;
  space?: string;
  sunlight?: string;
  season?: string;
  goals?: string[];
}

export function setGrowPlannerPreferences(preferences: GrowPlannerPrefs): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GROW_PLANNER_PREFS_KEY, JSON.stringify(preferences));
}

export function getGrowPlannerPreferences(): GrowPlannerPrefs | null {
  if (typeof window === 'undefined') return null;
  const storedPrefs = localStorage.getItem(GROW_PLANNER_PREFS_KEY);
  return storedPrefs ? JSON.parse(storedPrefs) : null;
}

// --- Smart Calendar Events ---

const CALENDAR_EVENTS_KEY = 'agripedia-calendar-events';

export interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description?: string;
  type: 'watering' | 'pruning' | 'harvesting' | 'planting' | 'custom';
  plantId?: string; // Optional: Link to a specific plant in MyPlants
}

export function getCalendarEvents(): CalendarEvent[] {
  if (typeof window === 'undefined') return [];
  const storedEvents = localStorage.getItem(CALENDAR_EVENTS_KEY);
  return storedEvents ? JSON.parse(storedEvents) : [];
}

export function addCalendarEvent(eventData: Omit<CalendarEvent, 'id'>): CalendarEvent {
  if (typeof window === 'undefined') {
    // This case should ideally not happen if called from client-side logic
    // or be handled appropriately if backend storage is introduced.
    // For now, returning a dummy event or throwing an error might be options.
    // However, to keep the flow, let's assume this is client-side.
    // If it's critical, add specific error handling or logging.
    console.warn('addCalendarEvent called in an undefined window environment. Event not saved to localStorage.');
    // Fallback: return the event with a temporary ID, won't be persisted.
    return { ...eventData, id: `temp-${Date.now()}` };
  }
  const events = getCalendarEvents();
  const newEvent: CalendarEvent = {
    ...eventData,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Simple unique ID
  };
  events.push(newEvent);
  localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(events));
  return newEvent;
}

export function updateCalendarEvent(updatedEvent: CalendarEvent): void {
  if (typeof window === 'undefined') return;
  let events = getCalendarEvents();
  events = events.map(event => (event.id === updatedEvent.id ? updatedEvent : event));
  localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(events));
}

export function removeCalendarEvent(eventId: string): void {
  if (typeof window === 'undefined') return;
  let events = getCalendarEvents();
  events = events.filter(event => event.id !== eventId);
  localStorage.setItem(CALENDAR_EVENTS_KEY, JSON.stringify(events));
}

// --- Plant Growth Journal Entries ---

const JOURNAL_ENTRIES_KEY = 'agripedia-journal-entries';

export interface JournalEntry {
  id: string;
  plantId: string; // User-entered text or ID from a future "My Plants" feature
  date: string; // YYYY-MM-DD
  notes?: string;
  photoUrl?: string; // base64 string for local preview, or actual URL if backend storage is used
  healthCondition?: 'Healthy' | 'Pest Detected' | 'Disease Suspected' | 'Nutrient Deficiency' | 'Other';
}

export function getJournalEntries(plantId?: string): JournalEntry[] {
  if (typeof window === 'undefined') return [];
  const storedEntries = localStorage.getItem(JOURNAL_ENTRIES_KEY);
  let entries: JournalEntry[] = storedEntries ? JSON.parse(storedEntries) : [];
  if (plantId) {
    entries = entries.filter(entry => entry.plantId === plantId);
  }
  return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Show newest first
}

export function addJournalEntry(entryData: Omit<JournalEntry, 'id'>): JournalEntry {
  if (typeof window === 'undefined') {
    console.warn('addJournalEntry called in an undefined window environment. Entry not saved to localStorage.');
    return { ...entryData, id: `temp-${Date.now()}` }; // Fallback, not persisted
  }
  const entries = getJournalEntries(); // Gets all entries, already sorted but order changes on push
  const newEntry: JournalEntry = {
    ...entryData,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Simple unique ID
  };
  entries.push(newEntry);
  localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
  return newEntry;
}

export function updateJournalEntry(updatedEntry: JournalEntry): void {
  if (typeof window === 'undefined') return;
  let entries = getJournalEntries(); // Get all entries
  entries = entries.map(entry => (entry.id === updatedEntry.id ? updatedEntry : entry));
  localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
}

export function removeJournalEntry(entryId: string): void {
  if (typeof window === 'undefined') return;
  let entries = getJournalEntries(); // Get all entries
  entries = entries.filter(entry => entry.id !== entryId);
  localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
}

// --- User's Tracked Plants (My Garden Overview) ---

const USER_PLANTS_KEY = 'agripedia-user-plants';

export interface UserPlant {
  id: string; // Should ideally match an ID/slug from the main produce data, e.g., "tomato"
  name: string;
  imagePlaceholder?: string; // For a generic icon or future image link
  careSummary: string; // e.g., "Watering: Moderate, Sunlight: Full Sun"
  slug: string; // For linking to the detailed page, e.g., "/item/tomato"
}

export function getUserPlants(): UserPlant[] {
  if (typeof window === 'undefined') return [];
  const storedUserPlants = localStorage.getItem(USER_PLANTS_KEY);
  return storedUserPlants ? JSON.parse(storedUserPlants) : [];
}

export function addUserPlant(plant: UserPlant): void {
  if (typeof window === 'undefined') return;
  const userPlants = getUserPlants();
  if (!userPlants.find(p => p.id === plant.id)) { // Ensure no duplicates by id
    userPlants.push(plant);
    localStorage.setItem(USER_PLANTS_KEY, JSON.stringify(userPlants));
  } else {
    console.warn(`Plant with id ${plant.id} already in user's plants.`);
  }
}

export function removeUserPlant(plantId: string): void {
  if (typeof window === 'undefined') return;
  let userPlants = getUserPlants();
  userPlants = userPlants.filter(p => p.id !== plantId);
  localStorage.setItem(USER_PLANTS_KEY, JSON.stringify(userPlants));
}

export function isUserPlant(plantId: string): boolean {
  if (typeof window === 'undefined') return false;
  const userPlants = getUserPlants();
  return userPlants.some(p => p.id === plantId);
}
