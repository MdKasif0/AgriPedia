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
