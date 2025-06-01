import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PersonalizedGrowPlanner from './PersonalizedGrowPlanner';
import * as userDataStore from '@/lib/userDataStore';
import * as aiFlows from '@/ai/flows/recommend-plants-flow'; // To mock the flow

// Mock the AI flow
const mockRecommendPlantsFlow = jest.spyOn(aiFlows, 'recommendPlantsFlow');
// Mock userDataStore functions
jest.mock('@/lib/userDataStore', () => ({
  savePlannerData: jest.fn(),
  getPlannerData: jest.fn(() => null), // Default to no existing data
  clearPlannerData: jest.fn(),
}));

// Mock child step components to simplify testing the planner itself
jest.mock('../planner/LocationStep', () => ({ data, onNext }: any) => <button onClick={() => onNext({ location: { climateZone: 'temperate', lat: 1, lon: 1 } })}>NextLocation</button>);
jest.mock('../planner/GrowingSpaceStep', () => ({ data, onNext }: any) => <button onClick={() => onNext({ space: 'garden' })}>NextSpace</button>);
jest.mock('../planner/SunlightExposureStep', () => ({ data, onNext }: any) => <button onClick={() => onNext({ sunlight: 'full_sun' })}>NextSunlight</button>);
jest.mock('../planner/PurposeStep', () => ({ data, onNext }: any) => <button onClick={() => onNext({ purpose: ['vegetables'] })}>NextPurpose</button>);
jest.mock('../planner/TimeCommitmentStep', () => ({ data, onNext }: any) => <button onClick={() => onNext({ timeCommitment: 'medium' })}>NextTime</button>);
jest.mock('../planner/ExperienceLevelStep', () => ({ data, onNext }: any) => <button onClick={() => onNext({ experience: 'beginner' })}>NextExperience</button>);

// Mock ErrorBoundary
jest.mock('../ErrorBoundary', () => ({ children }: { children: React.ReactNode }) => <>{children}</>);


describe('PersonalizedGrowPlanner', () => {
  beforeEach(() => {
    mockRecommendPlantsFlow.mockClear();
    (userDataStore.savePlannerData as jest.Mock).mockClear();
    (userDataStore.getPlannerData as jest.Mock).mockReturnValue(null); // Ensure it's reset
  });

  const completePlannerSteps = async () => {
    fireEvent.click(screen.getByText('NextLocation'));
    await waitFor(() => {}); // Allow state to update if necessary
    fireEvent.click(screen.getByText('NextSpace'));
    await waitFor(() => {});
    fireEvent.click(screen.getByText('NextSunlight'));
    await waitFor(() => {});
    fireEvent.click(screen.getByText('NextPurpose'));
    await waitFor(() => {});
    fireEvent.click(screen.getByText('NextTime'));
    await waitFor(() => {});
    fireEvent.click(screen.getByText('NextExperience'));
    await waitFor(() => {}); // Ensure all steps are processed
  };

  it('should display loading state and then recommendations when flow succeeds', async () => {
    mockRecommendPlantsFlow.mockResolvedValueOnce(['tomato', 'basil']);
    render(<PersonalizedGrowPlanner />);

    await completePlannerSteps();

    expect(screen.getByText('Finding the best plants for you...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Recommended Plants For You:')).toBeInTheDocument();
      expect(screen.getByText('tomato')).toBeInTheDocument();
      expect(screen.getByText('basil')).toBeInTheDocument();
    });
    expect(userDataStore.savePlannerData).toHaveBeenCalled();
    expect(mockRecommendPlantsFlow).toHaveBeenCalledTimes(1);
  });

  it('should display error message when flow fails', async () => {
    mockRecommendPlantsFlow.mockRejectedValueOnce(new Error('AI Error'));
    render(<PersonalizedGrowPlanner />);

    await completePlannerSteps();

    expect(screen.getByText('Finding the best plants for you...')).toBeInTheDocument(); // Shows loading first

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('AI Error')).toBeInTheDocument();
    });
    expect(userDataStore.savePlannerData).toHaveBeenCalled();
    expect(mockRecommendPlantsFlow).toHaveBeenCalledTimes(1);
  });

  it('should display "No Recommendations Yet" when flow returns empty array', async () => {
    mockRecommendPlantsFlow.mockResolvedValueOnce([]);
    render(<PersonalizedGrowPlanner />);

    await completePlannerSteps();

    expect(screen.getByText('Finding the best plants for you...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('No Recommendations Yet')).toBeInTheDocument();
    });
    expect(userDataStore.savePlannerData).toHaveBeenCalled();
    expect(mockRecommendPlantsFlow).toHaveBeenCalledTimes(1);
  });

  it('should call clearPlannerData and reset when "Start Over" is clicked', async () => {
    mockRecommendPlantsFlow.mockResolvedValueOnce(['tomato']);
    render(<PersonalizedGrowPlanner />);

    await completePlannerSteps();
    await waitFor(() => expect(screen.getByText('Recommended Plants For You:')).toBeInTheDocument());

    fireEvent.click(screen.getByText('Start Over'));

    await waitFor(() => {
      expect(userDataStore.clearPlannerData).toHaveBeenCalledTimes(1);
      // Check if it's back to the first step (LocationStep's button)
      expect(screen.getByText('NextLocation')).toBeInTheDocument();
    });
  });
});
