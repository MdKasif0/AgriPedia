'use client';

// --- New Data Structures for Grow Plan Progress ---
export interface StageProgress {
  completed: boolean;
  notes?: string; // For optional plant log per stage
  photoUrl?: string; // For optional plant log per stage
}

export interface PlantGuideProgress {
  plantId: string; // e.g., "basil_001"
  planterId: string; // A unique ID for this specific instance in a user's plan
  addedDate: string; // ISO date string when added to Grow Plan
  stageStartDates: Record<string, string>; // Key: stage.name, Value: ISO date string
  stageEndDates: Record<string, string>; // Key: stage.name, Value: ISO date string
  currentStage?: string; // Name of the current active stage
  stages: Record<string, StageProgress>; // Key: stage.name
  plantCommonName: string;
  guideStagesSummary: Array<{ stage: string; duration_days: number }>;
}

// User's overall progress for all plants in their Grow Plan
export interface GrowPlanProgress {
  plants: PlantGuideProgress[];
}

// Import PlannerData and validation function
import type { PlannerData } from '../types/planner'; // Adjusted path if necessary

// Original constants
const FAVORITES_KEY = 'agripedia-favorites';
const RECENT_SEARCHES_KEY = 'agripedia-recent-searches';
const GEMINI_API_KEY_STORAGE_KEY = 'agripedia-gemini-api-key';
const MAX_RECENT_SEARCHES = 5;
const USER_MODE_KEY = 'agripedia-user-mode';

// Assuming constants.ts exists in the same directory or one level up.
// If it's in './constants.ts': import { type UserModeId, DEFAULT_USER_MODE_ID } from './constants';
// If it's in '../lib/constants.ts' (relative to a component using this store, this path might be different here)
// For now, let's assume it's accessible. If not, these two lines might need adjustment or to be temporarily commented out.
// For the subtask, we will assume `constants.ts` is in the same directory for simplicity of this step.
// If it fails, we'll address it.
import { type UserModeId, DEFAULT_USER_MODE_ID } from './constants';


// --- Planner Data Validation ---
export function isValidPlannerData(data: any): data is PlannerData {
  if (typeof data !== 'object' || data === null) {
    console.error('Validation Error: Data is not an object.');
    return false;
  }
  if (typeof data.userId !== 'string') {
    console.error('Validation Error: userId is missing or not a string.');
    return false;
  }
  if (typeof data.location !== 'object' || data.location === null) {
    console.error('Validation Error: location is missing or not an object.');
    return false;
  }
  if (!('lat' in data.location && (typeof data.location.lat === 'number' || data.location.lat === null))) {
    console.error('Validation Error: location.lat is missing or not a number or null.');
    return false;
  }
  if (!('lon' in data.location && (typeof data.location.lon === 'number' || data.location.lon === null))) {
    console.error('Validation Error: location.lon is missing or not a number or null.');
    return false;
  }
  if (typeof data.location.climateZone !== 'string') {
    console.error('Validation Error: location.climateZone is missing or not a string.');
    return false;
  }
  if (typeof data.space !== 'string') {
    console.error('Validation Error: space is missing or not a string.');
    return false;
  }
  if (typeof data.sunlight !== 'string') {
    console.error('Validation Error: sunlight is missing or not a string.');
    return false;
  }
  if (!Array.isArray(data.purpose) || !data.purpose.every((p: any) => typeof p === 'string')) {
    console.error('Validation Error: purpose is missing or not an array of strings.');
    return false;
  }
  if (typeof data.experience !== 'string') {
    console.error('Validation Error: experience is missing or not a string.');
    return false;
  }
  if (typeof data.timeCommitment !== 'string') {
    console.error('Validation Error: timeCommitment is missing or not a string.');
    return false;
  }
  if (typeof data.createdAt !== 'string') {
    console.error('Validation Error: createdAt is missing or not a string.');
    return false;
  }
  return true;
}

// --- Personalized Grow Planner Data ---
const PLANNER_DATA_KEY = 'agripedia-planner-data';

export function savePlannerData(data: PlannerData): void {
  if (typeof window === 'undefined') return;
  if (!isValidPlannerData(data)) {
    console.error('Attempted to save invalid planner data. Aborting.', data);
    return;
  }
  try {
    const jsonData = JSON.stringify(data);
    localStorage.setItem(PLANNER_DATA_KEY, jsonData);
  } catch (error) {
    console.error('Error saving planner data to local storage:', error);
  }
}

export function getPlannerData(): PlannerData | null {
  if (typeof window === 'undefined') return null;
  const jsonData = localStorage.getItem(PLANNER_DATA_KEY);
  if (!jsonData) {
    return null;
  }
  try {
    const data = JSON.parse(jsonData);
    if (isValidPlannerData(data)) {
      return data;
    } else {
      console.error('Invalid planner data found in local storage.');
      // Optionally, clear the invalid data:
      // localStorage.removeItem(PLANNER_DATA_KEY);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving planner data from local storage:', error);
    return null;
  }
}

export function clearPlannerData(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(PLANNER_DATA_KEY);
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

// --- Grow Plan Progress ---
const GROW_PLAN_PROGRESS_KEY = 'agripedia-grow-plan-progress';

export function getGrowPlanProgress(): GrowPlanProgress | null {
  if (typeof window === 'undefined') return null;
  const jsonData = localStorage.getItem(GROW_PLAN_PROGRESS_KEY);
  if (!jsonData) {
    return { plants: [] }; // Return empty structure if nothing saved yet
  }
  try {
    // TODO: Add validation for this data structure similar to plannerData
    const data = JSON.parse(jsonData) as GrowPlanProgress;
    return data;
  } catch (error) {
    console.error('Error retrieving grow plan progress:', error);
    return { plants: [] };
  }
}

export function saveGrowPlanProgress(progress: GrowPlanProgress): void {
  if (typeof window === 'undefined') return;
  try {
    // TODO: Add validation before saving
    const jsonData = JSON.stringify(progress);
    localStorage.setItem(GROW_PLAN_PROGRESS_KEY, jsonData);
  } catch (error) {
    console.error('Error saving grow plan progress:', error);
  }
}

export function upsertPlantGuideProgress(plantProgress: PlantGuideProgress): void {
  if (typeof window === 'undefined') return;
  const currentProgress = getGrowPlanProgress() || { plants: [] };
  const plantIndex = currentProgress.plants.findIndex(p => p.planterId === plantProgress.planterId);

  if (plantIndex > -1) {
    currentProgress.plants[plantIndex] = plantProgress;
  } else {
    currentProgress.plants.push(plantProgress);
  }
  saveGrowPlanProgress(currentProgress);
}

export function getPlantGuideProgressByPlanterId(planterId: string): PlantGuideProgress | null {
    if (typeof window === 'undefined') return null;
    const currentProgress = getGrowPlanProgress();
    if (!currentProgress) return null;
    return currentProgress.plants.find(p => p.planterId === planterId) || null;
}

// --- Notification Preferences ---
export interface NotificationPrefs {
  frequency: 'all' | 'key_stages' | 'minimal' | 'off';
  tone: 'motivational' | 'minimal_info' | 'scientific';
  enableInApp: boolean;
  // enablePush?: boolean; // For future use
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  frequency: 'all',
  tone: 'motivational',
  enableInApp: true,
};

const NOTIFICATION_PREFS_KEY = 'agripedia-notification-prefs';

export function getNotificationPreferences(): NotificationPrefs {
  if (typeof window === 'undefined') return DEFAULT_NOTIFICATION_PREFS;
  const storedPrefs = localStorage.getItem(NOTIFICATION_PREFS_KEY);
  if (storedPrefs) {
    try {
      // TODO: Add validation for this data structure
      return JSON.parse(storedPrefs) as NotificationPrefs;
    } catch (e) {
      console.error("Error parsing notification preferences", e);
      return DEFAULT_NOTIFICATION_PREFS;
    }
  }
  return DEFAULT_NOTIFICATION_PREFS;
}

export function saveNotificationPreferences(prefs: NotificationPrefs): void {
  if (typeof window === 'undefined') return;
  try {
    // TODO: Add validation before saving
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent('notificationPrefsChanged', { detail: prefs }));
  } catch (error) {
    console.error('Error saving notification preferences:', error);
  }
}

// --- Shown Notifications Tracking ---
const SHOWN_NOTIFICATIONS_KEY = 'agripedia-shown-notifications';

export function getShownNotifications(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(SHOWN_NOTIFICATIONS_KEY);
  try {
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error("Error parsing shown notifications", error);
    return {};
  }
}

export function markNotificationAsShown(notificationId: string): void {
  if (typeof window === 'undefined') return;
  const shown = getShownNotifications();
  shown[notificationId] = true;
  try {
    localStorage.setItem(SHOWN_NOTIFICATIONS_KEY, JSON.stringify(shown));
  } catch (error) {
    console.error('Error saving shown notifications:', error);
  }
}

// --- User Mode ---
export function getCurrentUserMode(): UserModeId {
  if (typeof window === 'undefined') return DEFAULT_USER_MODE_ID;
  // Ensure DEFAULT_USER_MODE_ID is defined if the import fails.
  // const currentDefaultUserMode = typeof DEFAULT_USER_MODE_ID !== 'undefined' ? DEFAULT_USER_MODE_ID : 'default'; // Fallback
  const storedMode = localStorage.getItem(USER_MODE_KEY) as UserModeId | null;
  return storedMode || DEFAULT_USER_MODE_ID; // Use imported or fallback default
}

export function setCurrentUserMode(modeId: UserModeId): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_MODE_KEY, modeId);
  window.dispatchEvent(new CustomEvent('userModeChanged', { detail: { modeId } }));
}
