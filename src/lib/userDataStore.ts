
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

// --- Reminders ---

export interface Reminder {
  id: string; // Unique ID, e.g., timestamp or UUID
  task: string; // e.g., "Water Tomatoes", "Fertilize Basil"
  date: string; // ISO date string, e.g., "2024-07-28"
  notes?: string; // Optional notes
  isComplete: boolean;
}

const REMINDERS_KEY = 'agripedia-reminders';

export function getReminders(): Reminder[] {
  if (typeof window === 'undefined') return [];
  const storedReminders = localStorage.getItem(REMINDERS_KEY);
  const reminders = storedReminders ? JSON.parse(storedReminders) : [];
  return reminders.sort((a: Reminder, b: Reminder) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function addReminder(reminderData: Omit<Reminder, 'id' | 'isComplete'>): Reminder {
  if (typeof window === 'undefined') {
    // This case should ideally be handled by the caller or UI
    // For now, returning a dummy reminder to avoid breaking an expected return type
    // but this won't persist.
    console.warn("addReminder called in a non-browser environment. Reminder not saved.");
    return { ...reminderData, id: Date.now().toString(), isComplete: false };
  }
  const reminders = getReminders();
  const newReminder: Reminder = {
    ...reminderData,
    id: Date.now().toString(),
    isComplete: false,
  };
  reminders.push(newReminder);
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  return newReminder;
}

export function updateReminder(updatedReminder: Reminder): void {
  if (typeof window === 'undefined') return;
  let reminders = getReminders();
  reminders = reminders.map(r => (r.id === updatedReminder.id ? updatedReminder : r));
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

export function deleteReminder(reminderId: string): void {
  if (typeof window === 'undefined') return;
  let reminders = getReminders();
  reminders = reminders.filter(r => r.id !== reminderId);
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

export function toggleReminderComplete(reminderId: string): void {
  if (typeof window === 'undefined') return;
  let reminders = getReminders();
  reminders = reminders.map(r =>
    r.id === reminderId ? { ...r, isComplete: !r.isComplete } : r
  );
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
}

// --- Journal Entries ---

export interface JournalEntry {
  id: string; // Unique ID
  plantName: string; // Name of the plant this entry is for (free text for now)
  date: string; // ISO date string
  notes: string;
  imageUrl?: string; // Optional: for now, this could be a placeholder or external URL
  isMilestone?: boolean; // Optional: to mark significant events
}

const JOURNAL_ENTRIES_KEY = 'agripedia-journal-entries';

export function getJournalEntries(): JournalEntry[] {
  if (typeof window === 'undefined') return [];
  const storedEntries = localStorage.getItem(JOURNAL_ENTRIES_KEY);
  const entries = storedEntries ? JSON.parse(storedEntries) : [];
  return entries.sort((a: JournalEntry, b: JournalEntry) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort descending by date
}

export function addJournalEntry(entryData: Omit<JournalEntry, 'id'>): JournalEntry {
  if (typeof window === 'undefined') {
    console.warn("addJournalEntry called in a non-browser environment. Entry not saved.");
    return { ...entryData, id: Date.now().toString() };
  }
  const entries = getJournalEntries();
  const newEntry: JournalEntry = {
    ...entryData,
    id: Date.now().toString(),
  };
  entries.unshift(newEntry); // Add to the beginning for reverse chronological display
  localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
  return newEntry;
}

export function updateJournalEntry(updatedEntry: JournalEntry): void {
  if (typeof window === 'undefined') return;
  let entries = getJournalEntries();
  entries = entries.map(entry => (entry.id === updatedEntry.id ? updatedEntry : entry));
  localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
}

export function deleteJournalEntry(entryId: string): void {
  if (typeof window === 'undefined') return;
  let entries = getJournalEntries();
  entries = entries.filter(entry => entry.id !== entryId);
  localStorage.setItem(JOURNAL_ENTRIES_KEY, JSON.stringify(entries));
}
