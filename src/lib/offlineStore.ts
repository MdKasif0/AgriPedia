
'use client'; // This lib needs to run on the client

import type { ProduceInfo } from './produceData';

const OFFLINE_STORE_PREFIX = 'agripedia-item-';

export function saveProduceOffline(produce: ProduceInfo): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(`${OFFLINE_STORE_PREFIX}${produce.id}`, JSON.stringify(produce));
    } catch (error) {
      console.error('Error saving produce offline:', error);
      // Handle potential storage limits or other errors
    }
  }
}

export function getProduceOffline(id: string): ProduceInfo | null {
  if (typeof window !== 'undefined') {
    try {
      const storedData = localStorage.getItem(`${OFFLINE_STORE_PREFIX}${id}`);
      if (storedData) {
        return JSON.parse(storedData) as ProduceInfo;
      }
    } catch (error) {
      console.error('Error retrieving produce offline:', error);
    }
  }
  return null;
}

export function removeProduceOffline(id: string): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(`${OFFLINE_STORE_PREFIX}${id}`);
    } catch (error) {
      console.error('Error removing produce offline:', error);
    }
  }
}

export function listOfflineProduceIds(): string[] {
  if (typeof window !== 'undefined') {
    const ids: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(OFFLINE_STORE_PREFIX)) {
        ids.push(key.replace(OFFLINE_STORE_PREFIX, ''));
      }
    }
    return ids;
  }
  return [];
}
