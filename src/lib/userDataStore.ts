'use client';

import type { GrowPlannerData, StagedGrowPlan } from '../types/growPlanner'; // Added StagedGrowPlan
import { type UserModeId, DEFAULT_USER_MODE_ID } from './constants'; // Assuming constants.ts is in the same directory

// --- Constants ---
const FAVORITES_KEY = 'agripedia-favorites';
const RECENT_SEARCHES_KEY = 'agripedia-recent-searches';
const GEMINI_API_KEY_STORAGE_KEY = 'agripedia-gemini-api-key';
const USER_MODE_KEY = 'agripedia-user-mode';
export const GROW_PLANNER_DATA_KEY = 'agripedia-grow-planner-data';
export const STAGED_GROW_PLAN_KEY = 'agripedia-staged-grow-plan'; // Added for Staged Plan

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

export const saveGrowPlannerData = (data: GrowPlannerData): void => {
  if (typeof window === 'undefined') {
    return;
  }

  let plannerDataToSave = { ...data };
  if (!plannerDataToSave.planId) {
    plannerDataToSave.planId = `plan-${Date.now()}`;
  }
   // Ensure customName is present, provide a default if not
  if (!plannerDataToSave.customName) {
    plannerDataToSave.customName = `My Grow Plan ${new Date().toLocaleDateString()}`;
  }


  try {
    const existingDataString = localStorage.getItem(GROW_PLANNER_DATA_KEY);
    let allPlans: GrowPlannerData[] = [];

    if (existingDataString) {
      allPlans = JSON.parse(existingDataString);
      if (!Array.isArray(allPlans)) {
        console.warn("Existing Grow Planner data is not an array, re-initializing.");
        allPlans = [];
      }
    }

    const existingPlanIndex = allPlans.findIndex(plan => plan.planId === plannerDataToSave.planId);

    if (existingPlanIndex > -1) {
      // Update existing plan
      allPlans[existingPlanIndex] = plannerDataToSave;
    } else {
      // Add new plan
      allPlans.push(plannerDataToSave);
    }

    localStorage.setItem(GROW_PLANNER_DATA_KEY, JSON.stringify(allPlans));

  } catch (error) {
    console.error("Error saving Grow Planner data to localStorage:", error);
  }
};

export const getGrowPlannerData = (planId?: string): GrowPlannerData | GrowPlannerData[] | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const dataString = localStorage.getItem(GROW_PLANNER_DATA_KEY);
    if (!dataString) {
      return null;
    }

    const allPlans: GrowPlannerData[] = JSON.parse(dataString);
    if (!Array.isArray(allPlans)) {
        console.error("Grow Planner data in localStorage is not an array.");
        localStorage.removeItem(GROW_PLANNER_DATA_KEY); // Clear corrupted data
        return null;
    }

    if (planId) {
      const specificPlan = allPlans.find(plan => plan.planId === planId);
      return specificPlan || null;
    } else {
      return allPlans.length > 0 ? allPlans : null;
    }
  } catch (error) {
    console.error("Error retrieving Grow Planner data from localStorage:", error);
    return null;
  }
};

export const deleteGrowPlannerData = (planId: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const existingDataString = localStorage.getItem(GROW_PLANNER_DATA_KEY);
    if (!existingDataString) {
      return;
    }

    let allPlans: GrowPlannerData[] = JSON.parse(existingDataString);
    if (!Array.isArray(allPlans)) {
        console.error("Grow Planner data in localStorage is not an array, cannot delete.");
        return;
    }

    const updatedPlans = allPlans.filter(plan => plan.planId !== planId);

    if (updatedPlans.length === 0) {
      localStorage.removeItem(GROW_PLANNER_DATA_KEY);
    } else {
      localStorage.setItem(GROW_PLANNER_DATA_KEY, JSON.stringify(updatedPlans));
    }
  } catch (error) {
    console.error("Error deleting Grow Planner data from localStorage:", error);
  }
};

// --- Staged Grow Plan ---

export const getStagedGrowPlan = (): StagedGrowPlan | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const dataString = localStorage.getItem(STAGED_GROW_PLAN_KEY);
    if (!dataString) {
      return null;
    }
    return JSON.parse(dataString) as StagedGrowPlan;
  } catch (error) {
    console.error("Error retrieving Staged Grow Plan from localStorage:", error);
    return null;
  }
};

export const saveStagedGrowPlan = (plan: StagedGrowPlan): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(STAGED_GROW_PLAN_KEY, JSON.stringify(plan));
  } catch (error) {
    console.error("Error saving Staged Grow Plan to localStorage:", error);
  }
};

export const addPlantToStagedPlan = (plantId: string): StagedGrowPlan => {
  let currentPlan = getStagedGrowPlan();
  if (!currentPlan) {
    currentPlan = {
      planId: 'currentStagingPlan', // Default ID for the single staging plan
      plantIds: [],
      lastUpdatedAt: new Date().toISOString(),
      customName: 'My Current Selection'
    };
  }

  if (!currentPlan.plantIds.includes(plantId)) {
    currentPlan.plantIds.push(plantId);
  }
  currentPlan.lastUpdatedAt = new Date().toISOString();
  saveStagedGrowPlan(currentPlan);
  return currentPlan;
};

export const removePlantFromStagedPlan = (plantId: string): StagedGrowPlan | null => {
  let currentPlan = getStagedGrowPlan();
  if (!currentPlan) {
    return null; // Nothing to remove from
  }

  currentPlan.plantIds = currentPlan.plantIds.filter(id => id !== plantId);
  currentPlan.lastUpdatedAt = new Date().toISOString();

  if (currentPlan.plantIds.length === 0) {
    // Optional: clear the plan entirely if no plants are left, or keep it as an empty plan
    // For now, let's keep the plan but with an empty plantIds array
    // clearStagedGrowPlan(); // Uncomment to clear if empty
    // return null;
  }
  saveStagedGrowPlan(currentPlan);
  return currentPlan;
};

export const clearStagedGrowPlan = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(STAGED_GROW_PLAN_KEY);
  } catch (error) {
    console.error("Error clearing Staged Grow Plan from localStorage:", error);
  }
};
