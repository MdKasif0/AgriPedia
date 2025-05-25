// Import individual fruit data
import amlaFruit from './data/fruits/amla.json';
import appleFruit from './data/fruits/apple.json';
import avocadoFruit from './data/fruits/avocado.json';
import bananaFruit from './data/fruits/banana.json';
import berFruit from './data/fruits/ber.json';
import blueberryFruit from './data/fruits/blueberry.json';
import cherryFruit from './data/fruits/cherry.json';
import custardAppleFruit from './data/fruits/custard-apple.json';
import dragonFruitFruit from './data/fruits/dragon-fruit.json';
import figFruit from './data/fruits/fig.json';
import grapesFruit from './data/fruits/grapes.json';
import guavaFruit from './data/fruits/guava.json';
import jackfruitFruit from './data/fruits/jackfruit.json';
import jamunFruit from './data/fruits/jamun.json';
import kiwiFruit from './data/fruits/kiwi.json';
import kokumFruit from './data/fruits/kokum.json';
import lemonFruit from './data/fruits/lemon.json';
import lycheeFruit from './data/fruits/lychee.json';
import mangoFruit from './data/fruits/mango.json';
import mulberryFruit from './data/fruits/mulberry.json';
import muskmelonFruit from './data/fruits/muskmelon.json';
import orangeFruit from './data/fruits/orange.json';
import papayaFruit from './data/fruits/papaya.json';
import passionFruitFruit from './data/fruits/passion-fruit.json';
import peachFruit from './data/fruits/peach.json';
import pearFruit from './data/fruits/pear.json';
import pineappleFruit from './data/fruits/pineapple.json';
import plumFruit from './data/fruits/plum.json';
import pomegranateFruit from './data/fruits/pomegranate.json';
import raspberryFruit from './data/fruits/raspberry.json';
import sapotaFruit from './data/fruits/sapota.json';
import starfruitFruit from './data/fruits/starfruit.json';
import strawberryFruit from './data/fruits/strawberry.json';
import sweetLimeFruit from './data/fruits/sweet-lime.json';
import tamarindFruit from './data/fruits/tamarind.json';
import watermelonFruit from './data/fruits/watermelon.json';
import woodAppleFruit from './data/fruits/wood-apple.json';

// Import individual vegetable data
import arbiTaroRootVegetable from './data/vegetables/arbi-taro-root.json';
import ashGourdVegetable from './data/vegetables/ash-gourd.json';
import beetrootVegetable from './data/vegetables/beetroot.json';
import bitterGourdVegetable from './data/vegetables/bitter-gourd.json';
import bottleGourdVegetable from './data/vegetables/bottle-gourd.json';
import brinjalEggplantVegetable from './data/vegetables/brinjal-eggplant.json';
import broccoliVegetable from './data/vegetables/broccoli.json';
import cabbageVegetable from './data/vegetables/cabbage.json';
import capsicumVegetable from './data/vegetables/capsicum.json';
import carrotVegetable from './data/vegetables/carrot.json';
import cauliflowerVegetable from './data/vegetables/cauliflower.json';
import chilliesVegetable from './data/vegetables/chillies.json';
import clusterBeansVegetable from './data/vegetables/cluster-beans.json';
import corianderLeavesVegetable from './data/vegetables/coriander-leaves.json';
import cucumberVegetable from './data/vegetables/cucumber.json';
import dillLeavesVegetable from './data/vegetables/dill-leaves.json';
import drumstickMoringaVegetable from './data/vegetables/drumstick-moringa.json';
import elephantFootYamVegetable from './data/vegetables/elephant-foot-yam.json';
import fenugreekLeavesVegetable from './data/vegetables/fenugreek-leaves.json';
import frenchBeansVegetable from './data/vegetables/french-beans.json';
import garlicVegetable from './data/vegetables/garlic.json';
import gingerVegetable from './data/vegetables/ginger.json';
import greenGarlicVegetable from './data/vegetables/green-garlic.json';
import greenPeasVegetable from './data/vegetables/green-peas.json';
import ladyfingerOkraVegetable from './data/vegetables/ladyfinger-okra.json';
import mintLeavesVegetable from './data/vegetables/mint-leaves.json';
import mustardGreensVegetable from './data/vegetables/mustard-greens.json';
import onionVegetable from './data/vegetables/onion.json';
import potatoVegetable from './data/vegetables/potato.json';
import pumpkinVegetable from './data/vegetables/pumpkin.json';
import radishVegetable from './data/vegetables/radish.json';
import rawBananaVegetable from './data/vegetables/raw-banana.json';
import rawMangoVegetable from './data/vegetables/raw-mango.json';
import ridgeGourdVegetable from './data/vegetables/ridge-gourd.json';
import snakeGourdVegetable from './data/vegetables/snake-gourd.json';
import spinachVegetable from './data/vegetables/spinach.json';
import tindaAppleGourdVegetable from './data/vegetables/tinda-apple-gourd.json';
import tomatoVegetable from './data/vegetables/tomato.json';
import turnipVegetable from './data/vegetables/turnip.json';

export interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
}
export interface ProduceInfo {
  id: string;
  commonName: string;
  scientificName: string;
  image: string;
  description: string;
  origin: string;
  localNames: string[];
  regions: string[];
  seasons: string[];
  nutrition: {
    calories: string;
    macronutrients: Array<{ name: string; value: number; unit: string }>;
    vitamins: Array<{ name: string; value: number; unit: string; rdi?: string }>;
    minerals: Array<{ name: string; value: number; unit: string; rdi?: string }>;
  };
  healthBenefits: string[];
  potentialAllergies: Array<{
    name: string;
    severity: 'Mild' | 'Moderate' | 'Severe' | 'Common' | 'Rare' | 'Varies';
    details?: string;
  }>;
  cultivationProcess: string;
  growthDuration: string;
  sustainabilityTips?: string[];
  carbonFootprintInfo?: string;
  staticRecipes?: Recipe[];
}

const fruits: ProduceInfo[] = [
  amlaFruit as ProduceInfo,
  appleFruit as ProduceInfo,
  avocadoFruit as ProduceInfo,
  bananaFruit as ProduceInfo,
  berFruit as ProduceInfo,
  blueberryFruit as ProduceInfo,
  cherryFruit as ProduceInfo,
  custardAppleFruit as ProduceInfo,
  dragonFruitFruit as ProduceInfo,
  figFruit as ProduceInfo,
  grapesFruit as ProduceInfo,
  guavaFruit as ProduceInfo,
  jackfruitFruit as ProduceInfo,
  jamunFruit as ProduceInfo,
  kiwiFruit as ProduceInfo,
  kokumFruit as ProduceInfo,
  lemonFruit as ProduceInfo,
  lycheeFruit as ProduceInfo,
  mangoFruit as ProduceInfo,
  mulberryFruit as ProduceInfo,
  muskmelonFruit as ProduceInfo,
  orangeFruit as ProduceInfo,
  papayaFruit as ProduceInfo,
  passionFruitFruit as ProduceInfo,
  peachFruit as ProduceInfo,
  pearFruit as ProduceInfo,
  pineappleFruit as ProduceInfo,
  plumFruit as ProduceInfo,
  pomegranateFruit as ProduceInfo,
  raspberryFruit as ProduceInfo,
  sapotaFruit as ProduceInfo,
  starfruitFruit as ProduceInfo,
  strawberryFruit as ProduceInfo,
  sweetLimeFruit as ProduceInfo,
  tamarindFruit as ProduceInfo,
  watermelonFruit as ProduceInfo,
  woodAppleFruit as ProduceInfo,
];

const vegetables: ProduceInfo[] = [
  arbiTaroRootVegetable as ProduceInfo,
  ashGourdVegetable as ProduceInfo,
  beetrootVegetable as ProduceInfo,
  bitterGourdVegetable as ProduceInfo,
  bottleGourdVegetable as ProduceInfo,
  brinjalEggplantVegetable as ProduceInfo,
  broccoliVegetable as ProduceInfo,
  cabbageVegetable as ProduceInfo,
  capsicumVegetable as ProduceInfo,
  carrotVegetable as ProduceInfo,
  cauliflowerVegetable as ProduceInfo,
  chilliesVegetable as ProduceInfo,
  clusterBeansVegetable as ProduceInfo,
  corianderLeavesVegetable as ProduceInfo,
  cucumberVegetable as ProduceInfo,
  dillLeavesVegetable as ProduceInfo,
  drumstickMoringaVegetable as ProduceInfo,
  elephantFootYamVegetable as ProduceInfo,
  fenugreekLeavesVegetable as ProduceInfo,
  frenchBeansVegetable as ProduceInfo,
  garlicVegetable as ProduceInfo,
  gingerVegetable as ProduceInfo,
  greenGarlicVegetable as ProduceInfo,
  greenPeasVegetable as ProduceInfo,
  ladyfingerOkraVegetable as ProduceInfo,
  mintLeavesVegetable as ProduceInfo,
  mustardGreensVegetable as ProduceInfo,
  onionVegetable as ProduceInfo,
  potatoVegetable as ProduceInfo,
  pumpkinVegetable as ProduceInfo,
  radishVegetable as ProduceInfo,
  rawBananaVegetable as ProduceInfo,
  rawMangoVegetable as ProduceInfo,
  ridgeGourdVegetable as ProduceInfo,
  snakeGourdVegetable as ProduceInfo,
  spinachVegetable as ProduceInfo,
  tindaAppleGourdVegetable as ProduceInfo,
  tomatoVegetable as ProduceInfo,
  turnipVegetable as ProduceInfo,
];

const allProduceData: ProduceInfo[] = [...fruits, ...vegetables];

export function getProduceByCommonName(name: string): ProduceInfo | undefined {
  const searchTerm = name.toLowerCase();
  return allProduceData.find(p => p.commonName.toLowerCase() === searchTerm || p.id.toLowerCase() === searchTerm);
}

export function searchProduce(
  query: string,
  filters: { region?: string; season?: string } = {}
): ProduceInfo[] {
  const searchTerm = query.toLowerCase().trim();
  let results = allProduceData;

  if (searchTerm) {
    results = results.filter(p =>
      p.commonName.toLowerCase().includes(searchTerm) ||
      p.scientificName.toLowerCase().includes(searchTerm) ||
      p.localNames.some(ln => ln.toLowerCase().includes(searchTerm)) ||
      p.description.toLowerCase().includes(searchTerm)
    );
  }

  if (filters.region && filters.region !== 'all') {
    results = results.filter(p => p.regions.includes(filters.region!));
  }

  if (filters.season && filters.season !== 'all') {
    results = results.filter(p => p.seasons.includes(filters.season!));
  }

  return results;
}

export function getAllProduce(): ProduceInfo[] {
  return allProduceData;
}

export function getUniqueRegions(): string[] {
  const allRegions = allProduceData.flatMap(p => p.regions);
  return Array.from(new Set(allRegions)).sort();
}

export function getUniqueSeasons(): string[] {
  const allSeasons = allProduceData.flatMap(p => p.seasons);
  return Array.from(new Set(allSeasons)).sort();
}

function getCurrentSeasonName(): string {
  const month = new Date().getMonth(); // 0 (Jan) - 11 (Dec)
  if (month >= 2 && month <= 4) return 'Spring'; // Mar, Apr, May
  if (month >= 5 && month <= 7) return 'Summer'; // Jun, Jul, Aug
  if (month >= 8 && month <= 10) return 'Autumn'; // Sep, Oct, Nov
  return 'Winter'; // Dec, Jan, Feb
}

export function getInSeasonProduce(limit?: number): ProduceInfo[] {
  const currentSeason = getCurrentSeasonName();
  const inSeasonItems = allProduceData.filter(produce =>
    produce.seasons.includes(currentSeason)
  );

  // Shuffle for variety if more items than limit
  if (limit && inSeasonItems.length > limit) {
    for (let i = inSeasonItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [inSeasonItems[i], inSeasonItems[j]] = [inSeasonItems[j], inSeasonItems[i]];
    }
    return inSeasonItems.slice(0, limit);
  }
  if (limit) {
    return inSeasonItems.slice(0, limit);
  }
  return inSeasonItems;
}
