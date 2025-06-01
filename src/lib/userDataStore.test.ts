import {
  savePlannerData,
  getPlannerData,
  clearPlannerData,
  isValidPlannerData, // Also import this to use in tests if needed, or mock it
} from './userDataStore'; // Adjust path if your test file is elsewhere
import type { PlannerData } from '../types/planner';

// Mock localStorage
let mockStorage: { [key: string]: string } = {};

beforeAll(() => {
  global.Storage.prototype.setItem = jest.fn((key, value) => {
    mockStorage[key] = value;
  });
  global.Storage.prototype.getItem = jest.fn((key) => mockStorage[key] || null);
  global.Storage.prototype.removeItem = jest.fn((key) => {
    delete mockStorage[key];
  });
  global.Storage.prototype.clear = jest.fn(() => {
    mockStorage = {};
  });
});

beforeEach(() => {
  // Clear mock storage before each test and reset mocks
  mockStorage = {};
  jest.clearAllMocks();
  // Mock console.error to avoid cluttering test output for expected errors
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Restore console.error
  jest.restoreAllMocks();
});

const PLANNER_DATA_KEY = 'agripedia-planner-data';

// Sample valid planner data for testing
const samplePlannerData: PlannerData = {
  userId: 'testUser123',
  location: {
    lat: 40.7128,
    lon: -74.006,
    climateZone: 'Temperate',
    address: '123 Main St',
  },
  space: 'balcony',
  sunlight: 'partial',
  purpose: ['herbs', 'vegetables'],
  experience: 'beginner',
  timeCommitment: 'low',
  createdAt: new Date().toISOString(),
};

describe('Planner Data Storage', () => {
  describe('savePlannerData', () => {
    it('should save valid planner data to localStorage', () => {
      savePlannerData(samplePlannerData);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        PLANNER_DATA_KEY,
        JSON.stringify(samplePlannerData)
      );
      expect(mockStorage[PLANNER_DATA_KEY]).toEqual(JSON.stringify(samplePlannerData));
    });

    it('should not save invalid planner data and log an error', () => {
      const invalidData = { ...samplePlannerData, userId: null } as any; // Make it invalid
      savePlannerData(invalidData);
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        'Attempted to save invalid planner data. Aborting.',
        invalidData
      );
    });
  });

  describe('getPlannerData', () => {
    it('should retrieve and parse valid planner data from localStorage', () => {
      mockStorage[PLANNER_DATA_KEY] = JSON.stringify(samplePlannerData);
      const retrievedData = getPlannerData();
      expect(localStorage.getItem).toHaveBeenCalledWith(PLANNER_DATA_KEY);
      expect(retrievedData).toEqual(samplePlannerData);
    });

    it('should return null if no data is in localStorage', () => {
      const retrievedData = getPlannerData();
      expect(localStorage.getItem).toHaveBeenCalledWith(PLANNER_DATA_KEY);
      expect(retrievedData).toBeNull();
    });

    it('should return null and log an error if data in localStorage is invalid JSON', () => {
      mockStorage[PLANNER_DATA_KEY] = 'invalid json';
      const retrievedData = getPlannerData();
      expect(retrievedData).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Error retrieving planner data from local storage:',
        expect.any(SyntaxError) // Or specific error
      );
    });

    it('should return null and log an error if data in localStorage is not valid PlannerData', () => {
      const invalidStoredData = { ...samplePlannerData, space: undefined } as any;
      mockStorage[PLANNER_DATA_KEY] = JSON.stringify(invalidStoredData);
      const retrievedData = getPlannerData();
      expect(retrievedData).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Invalid planner data found in local storage.');
    });
  });

  describe('clearPlannerData', () => {
    it('should remove planner data from localStorage', () => {
      mockStorage[PLANNER_DATA_KEY] = JSON.stringify(samplePlannerData);
      clearPlannerData();
      expect(localStorage.removeItem).toHaveBeenCalledWith(PLANNER_DATA_KEY);
      expect(mockStorage[PLANNER_DATA_KEY]).toBeUndefined();
    });
  });

  // Minimal test for isValidPlannerData, more exhaustive tests could be added
  // if its logic becomes more complex.
  describe('isValidPlannerData', () => {
    it('should return true for valid data', () => {
      expect(isValidPlannerData(samplePlannerData)).toBe(true);
    });

    it('should return false for data missing a required field (e.g., userId)', () => {
      const invalidData = { ...samplePlannerData } as Partial<PlannerData>;
      delete invalidData.userId;
      expect(isValidPlannerData(invalidData)).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Validation Error: userId is missing or not a string.');
    });

    it('should return false for data with incorrect type for a field (e.g., purpose not an array)', () => {
      const invalidData = { ...samplePlannerData, purpose: 'not-an-array' } as any;
      expect(isValidPlannerData(invalidData)).toBe(false);
      expect(console.error).toHaveBeenCalledWith('Validation Error: purpose is missing or not an array of strings.');
    });
  });
});

// --- Tests for Growing Guide Progress ---
import {
  GROWING_GUIDE_PROGRESS_KEY,
  type PlantGrowProgress,
  savePlantGrowProgress,
  getPlantGrowProgress,
  updateStageCompletion,
  addPlantLog,
} from './userDataStore';


describe('Growing Guide Progress Storage', () => {
  const plantId1 = 'basil_user123_plotA';
  const produceId1 = 'basil';
  const plantId2 = 'tomato_user123_garden';
  const produceId2 = 'tomato';

  const sampleProgress1: PlantGrowProgress = {
    plantId: plantId1,
    produceId: produceId1,
    completedStages: ['Seed Starting', 'Germination'],
    currentStageIndex: 2,
    stageLogs: {
      'Seed Starting': { notes: 'Seeds sown on date.', loggedAt: new Date().toISOString() },
    },
    startDate: new Date('2024-01-01T00:00:00.000Z').toISOString(),
  };

  const sampleProgress2: PlantGrowProgress = {
    plantId: plantId2,
    produceId: produceId2,
    completedStages: ['Flowering'],
  };

  describe('savePlantGrowProgress and getPlantGrowProgress', () => {
    it('should save plant progress and retrieve it', () => {
      savePlantGrowProgress(plantId1, sampleProgress1);
      const retrieved = getPlantGrowProgress(plantId1);

      expect(localStorage.setItem).toHaveBeenCalledTimes(1);
      expect(retrieved).toEqual(expect.objectContaining(sampleProgress1));
      expect(retrieved?.lastUpdated).toBeDefined();
    });

    it('should save multiple plant progresses and retrieve them correctly', () => {
      savePlantGrowProgress(plantId1, sampleProgress1);
      savePlantGrowProgress(plantId2, sampleProgress2);

      const retrieved1 = getPlantGrowProgress(plantId1);
      const retrieved2 = getPlantGrowProgress(plantId2);

      expect(retrieved1).toEqual(expect.objectContaining(sampleProgress1));
      expect(retrieved2).toEqual(expect.objectContaining(sampleProgress2));
    });

    it('should return null if no progress is found for a plantId', () => {
      const retrieved = getPlantGrowProgress('non_existent_plant');
      expect(retrieved).toBeNull();
    });

    it('should overwrite existing progress when saving with the same plantId', () => {
      savePlantGrowProgress(plantId1, sampleProgress1);
      const updatedProgress = {
        ...sampleProgress1,
        completedStages: [...sampleProgress1.completedStages, 'New Stage']
      };
      savePlantGrowProgress(plantId1, updatedProgress);

      const retrieved = getPlantGrowProgress(plantId1);
      expect(retrieved?.completedStages).toContain('New Stage');
      expect(retrieved?.completedStages).toHaveLength(3);
    });
  });

  describe('updateStageCompletion', () => {
    it('should add a stage to completedStages if isComplete is true and stage is not present', () => {
      updateStageCompletion(plantId1, produceId1, 'Vegetative', true);
      const progress = getPlantGrowProgress(plantId1);
      expect(progress?.completedStages).toContain('Vegetative');
    });

    it('should initialize progress if none exists when updating a stage', () => {
      updateStageCompletion('newPlant', 'newProduce', 'First Stage', true);
      const progress = getPlantGrowProgress('newPlant');
      expect(progress).not.toBeNull();
      expect(progress?.plantId).toBe('newPlant');
      expect(progress?.produceId).toBe('newProduce');
      expect(progress?.completedStages).toEqual(['First Stage']);
      expect(progress?.lastUpdated).toBeDefined();
    });

    it('should remove a stage from completedStages if isComplete is false and stage is present', () => {
      // First, add the stage
      updateStageCompletion(plantId1, produceId1, 'Seed Starting', true);
      let progress = getPlantGrowProgress(plantId1);
      expect(progress?.completedStages).toContain('Seed Starting');

      // Then, remove it
      updateStageCompletion(plantId1, produceId1, 'Seed Starting', false);
      progress = getPlantGrowProgress(plantId1);
      expect(progress?.completedStages).not.toContain('Seed Starting');
    });

    it('should not change completedStages if adding an already present stage', () => {
      savePlantGrowProgress(plantId1, sampleProgress1); // Contains 'Seed Starting'
      updateStageCompletion(plantId1, produceId1, 'Seed Starting', true);
      const progress = getPlantGrowProgress(plantId1);
      expect(progress?.completedStages.filter(s => s === 'Seed Starting').length).toBe(1);
      expect(progress?.completedStages).toEqual(sampleProgress1.completedStages);
    });

    it('should not change completedStages if removing an absent stage', () => {
      savePlantGrowProgress(plantId1, sampleProgress1);
      updateStageCompletion(plantId1, produceId1, 'NonExistent Stage', false);
      const progress = getPlantGrowProgress(plantId1);
      expect(progress?.completedStages).toEqual(sampleProgress1.completedStages);
    });
  });

  describe('addPlantLog', () => {
    it('should add a log to a new plant', () => {
      const logEntry = { notes: 'First log entry.' };
      addPlantLog('logPlant1', 'logProduce1', 'Planting', logEntry);
      const progress = getPlantGrowProgress('logPlant1');

      expect(progress).not.toBeNull();
      expect(progress?.produceId).toBe('logProduce1');
      expect(progress?.stageLogs?.['Planting']?.notes).toBe('First log entry.');
      expect(progress?.stageLogs?.['Planting']?.loggedAt).toBeDefined();
    });

    it('should add a log to an existing plant with existing logs', () => {
      savePlantGrowProgress(plantId1, sampleProgress1); // Has log for 'Seed Starting'
      const newLogEntry = { notes: 'Watered well.', photoUrl: 'watered.jpg' };
      addPlantLog(plantId1, produceId1, 'Germination', newLogEntry);

      const progress = getPlantGrowProgress(plantId1);
      expect(progress?.stageLogs?.['Germination']?.notes).toBe('Watered well.');
      expect(progress?.stageLogs?.['Germination']?.photoUrl).toBe('watered.jpg');
      expect(progress?.stageLogs?.['Seed Starting']?.notes).toBe('Seeds sown on date.'); // Ensure old log still there
    });

    it('should overwrite an existing log for the same plant and stage', () => {
      const initialLog = { notes: 'Initial observation.' };
      addPlantLog(plantId1, produceId1, 'Observation', initialLog);

      const updatedLog = { notes: 'Updated observation, previous one gone.' };
      addPlantLog(plantId1, produceId1, 'Observation', updatedLog);

      const progress = getPlantGrowProgress(plantId1);
      expect(progress?.stageLogs?.['Observation']?.notes).toBe('Updated observation, previous one gone.');
    });
  });
});
