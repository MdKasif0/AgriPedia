
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function triggerHapticFeedback(): void {
  if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
    // Standard short vibration for most interactions
    // For more specific patterns, you could pass an array like [100, 30, 100]
    window.navigator.vibrate(50);
  }
}

export function playSound(soundUrl: string): void {
  if (typeof window !== 'undefined' && typeof Audio !== 'undefined') {
    try {
      const audio = new Audio(soundUrl);
      // Attempt to play the sound. Modern browsers might restrict autoplay.
      audio.play().catch(error => console.error(`Error playing sound ${soundUrl}:`, error));
    } catch (error) {
      console.error(`Error initializing audio for ${soundUrl}:`, error);
    }
  }
}
