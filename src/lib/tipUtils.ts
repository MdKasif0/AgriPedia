
import tipsData from './data/agri-tips.json';

const DEFAULT_TIP = "Stay curious and keep exploring the world of produce!";

export function getRandomAgriTip(): string {
  if (!tipsData || tipsData.length === 0) {
    console.warn("Agri-tips.json is empty or not found. Serving default tip.");
    return DEFAULT_TIP;
  }
  const randomIndex = Math.floor(Math.random() * tipsData.length);
  return tipsData[randomIndex] || DEFAULT_TIP; // Fallback if randomIndex is out of bounds (should not happen)
}
