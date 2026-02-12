import { recommendPlantsFlow } from './recommend-plants-flow';
import { PlannerData } from '@/types/planner';
import { PlantData } from '@/types/plant.schema'; // Using the Zod-generated type for structure
import { promises as fs } from 'fs';
import path from 'path';

// Mock the getAllPlantData function used internally by the flow
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  promises: {
    ...jest.requireActual('fs').promises,
    readdir: jest.fn(),
    readFile: jest.fn(),
    stat: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

const mockPlantDatabase: PlantData[] = [
  {
    id: 'tomato',
    commonName: 'Tomato',
    scientificName: 'Solanum lycopersicum',
    climaticRequirements: { temperature: 'Warm, temperate' },
    lightRequirement: 'full_sun',
    experienceLevel: 'beginner',
    spaceSuitability: ['garden', 'balcony_pots'],
    seasons: ['Summer'],
  },
  {
    id: 'apple',
    commonName: 'Apple Tree',
    scientificName: 'Malus domestica',
    climaticRequirements: { temperature: 'Cool temperate, needs chill' },
    lightRequirement: 'full_sun',
    experienceLevel: 'intermediate',
    spaceSuitability: ['garden'],
    seasons: ['Autumn', 'Winter'],
  },
  {
    id: 'basil',
    commonName: 'Basil',
    scientificName: 'Ocimum basilicum',
    climaticRequirements: { temperature: 'Warm, sunny' },
    lightRequirement: 'full_sun',
    experienceLevel: 'beginner',
    spaceSuitability: ['balcony_pots', 'indoor', 'garden'],
    seasons: ['Summer', 'Year-round indoors'],
  },
  {
    id: 'fern',
    commonName: 'Boston Fern',
    scientificName: 'Nephrolepis exaltata',
    climaticRequirements: { temperature: 'Mild, humid' },
    lightRequirement: 'shade',
    experienceLevel: 'beginner',
    spaceSuitability: ['indoor', 'hanging_baskets'],
    seasons: ['Year-round indoors'],
  },
  {
    id: 'orchid',
    commonName: 'Orchid',
    scientificName: 'Orchidaceae',
    climaticRequirements: { temperature: 'Varies (many types), generally warm' },
    lightRequirement: 'partial_shade',
    experienceLevel: 'expert',
    spaceSuitability: ['indoor'],
    seasons: ['Varies'],
  },
];

beforeEach(() => {
  // Reset mocks before each test
  mockFs.readdir.mockReset();
  mockFs.readFile.mockReset();
  mockFs.stat.mockReset();

  // Setup mock fs behavior to return our mock plant database
  // This simulates the behavior of getAllPlantData
  mockFs.readdir.mockImplementation(async (dirPath) => {
    if (dirPath.toString().endsWith('src/lib/data')) {
      return ['vegetables', 'fruits', 'herbsAndSpices', 'ornamentals'] as any;
    }
    const category = path.basename(dirPath.toString());
    if (category === 'vegetables') return ['tomato.json'] as any;
    if (category === 'fruits') return ['apple.json'] as any;
    if (category === 'herbsAndSpices') return ['basil.json'] as any;
    if (category === 'ornamentals') return ['fern.json', 'orchid.json'] as any;
    return [] as any;
  });

  mockFs.readFile.mockImplementation(async (filePath) => {
    const id = path.basename(filePath.toString(), '.json');
    const plant = mockPlantDatabase.find(p => p.id === id);
    return JSON.stringify(plant) as any;
  });

  mockFs.stat.mockResolvedValue({ isDirectory: () => true } as any);
});

describe('recommendPlantsFlow', () => {
  it('should recommend tomato and basil for a beginner in a temperate summer, full sun, balcony', async () => {
    const plannerData: PlannerData = {
      userId: 'testUser',
      location: { lat: 40, lon: -70, climateZone: 'temperate' }, // NYC, Northern Hemi
      space: 'balcony_pots',
      sunlight: 'full_sun',
      purpose: ['vegetables', 'herbs'],
      experience: 'beginner',
      timeCommitment: 'medium',
      createdAt: new Date().toISOString(),
    };
    // Mock current date to be June (month 6) for Northern Hemisphere Summer
    jest.useFakeTimers().setSystemTime(new Date('2023-06-15'));

    const recommendations = await recommendPlantsFlow(plannerData);
    expect(recommendations).toContain('tomato');
    expect(recommendations).toContain('basil');
    expect(recommendations.length).toBe(2);

    jest.useRealTimers();
  });

  it('should recommend fern for a beginner in mild climate, shade, indoor', async () => {
    const plannerData: PlannerData = {
      userId: 'testUser2',
      location: { lat: 30, lon: 0, climateZone: 'mild' },
      space: 'indoor',
      sunlight: 'shade',
      purpose: ['decoration'],
      experience: 'beginner',
      timeCommitment: 'low',
      createdAt: new Date().toISOString(),
    };
    // Seasonality less critical for indoor plants marked year-round
    jest.useFakeTimers().setSystemTime(new Date('2023-01-10'));

    const recommendations = await recommendPlantsFlow(plannerData);
    expect(recommendations).toContain('fern');
    expect(recommendations.length).toBe(1);

    jest.useRealTimers();
  });

  it('should recommend no plants if experience level is too low for available plants', async () => {
    const plannerData: PlannerData = {
      userId: 'testUser3',
      location: { lat: 20, lon: 0, climateZone: 'warm' },
      space: 'indoor',
      sunlight: 'partial_shade',
      purpose: ['flowers'],
      experience: 'beginner', // Orchid is 'expert'
      timeCommitment: 'high',
      createdAt: new Date().toISOString(),
    };
    jest.useFakeTimers().setSystemTime(new Date('2023-03-20'));
    const recommendations = await recommendPlantsFlow(plannerData);
    expect(recommendations.length).toBe(0);
    jest.useRealTimers();
  });

  it('should recommend apple tree for intermediate gardener in cool temperate autumn, full sun, garden', async () => {
    const plannerData: PlannerData = {
        userId: 'testUserApple',
        location: { lat: 45, lon: -75, climateZone: 'cool temperate' }, // Northern Hemi
        space: 'garden',
        sunlight: 'full_sun',
        purpose: ['fruits'],
        experience: 'intermediate',
        timeCommitment: 'high',
        createdAt: new Date().toISOString(),
    };
    // Mock current date to be October (month 10) for Northern Hemisphere Autumn
    jest.useFakeTimers().setSystemTime(new Date('2023-10-01'));

    const recommendations = await recommendPlantsFlow(plannerData);
    expect(recommendations).toContain('apple');
    expect(recommendations.length).toBe(1);

    jest.useRealTimers();
  });

  it('should return an empty array if no plants match all criteria', async () => {
    const plannerData: PlannerData = {
      userId: 'testUserNone',
      location: { lat: 0, lon: 0, climateZone: 'arctic' }, // No plants for arctic
      space: 'garden',
      sunlight: 'full_sun',
      purpose: ['vegetables'],
      experience: 'expert',
      timeCommitment: 'high',
      createdAt: new Date().toISOString(),
    };
    const recommendations = await recommendPlantsFlow(plannerData);
    expect(recommendations.length).toBe(0);
  });
});
