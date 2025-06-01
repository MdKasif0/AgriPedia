import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import StepByStepGuides from './StepByStepGuides'; // Adjust path as necessary
import type { ProduceInfo, GrowingStage } from '@/lib/produceData'; // Adjust path
import type { PlannerData } from '@/types/planner'; // Adjust path

// Mock next/navigation
const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}));

// Mock useToast
const mockToast = jest.fn();
jest.mock('@/hooks/use-toast', () => ({ // Adjust path as necessary
  useToast: () => ({
    toast: mockToast,
  }),
}));

// Mock userDataStore
const mockGetPlantGrowProgress = jest.fn();
const mockUpdateStageCompletion = jest.fn();
jest.mock('@/lib/userDataStore', () => ({ // Adjust path as necessary
  getPlantGrowProgress: (plantInstanceId: string) => mockGetPlantGrowProgress(plantInstanceId),
  updateStageCompletion: (plantInstanceId: string, produceId: string, stageName: string, isComplete: boolean) =>
    mockUpdateStageCompletion(plantInstanceId, produceId, stageName, isComplete),
}));

const mockProduceData: ProduceInfo = {
  id: 'basil-test',
  commonName: 'Test Basil',
  scientificName: 'Ocimum testilicum',
  image: 'basil.jpg',
  description: 'A test basil plant.',
  origin: 'Test Origin',
  localNames: [],
  regions: [],
  seasons: [],
  nutrition: { calories: '', macronutrients: [], vitamins: [], minerals: [] },
  healthBenefits: [],
  potentialAllergies: [],
  cultivationProcess: '',
  growthDuration: '',
  growing_guide: [
    {
      stage: 'Seed Starting',
      duration_days: 10,
      instructions: ['Sow seeds', 'Water gently'],
      media: { images: ['seed1.jpg', 'seed2.jpg'] },
      reminders: ['Check moisture daily'],
      micro_tips_warnings: [{ type: 'tip', content: 'Use warm water' }],
    },
    {
      stage: 'Vegetative Growth',
      duration_days: 20,
      instructions: ['Fertilize', 'Provide light'],
      media: { video: 'growth.mp4', images: ['veg1.jpg'] },
      reminders: ['Watch for pests'],
      micro_tips_warnings: [
        { type: 'warning', content: 'Do not overfertilize', collapsible: true }
      ],
    },
    {
      stage: 'Harvesting',
      duration_days: 5,
      instructions: ['Harvest leaves'],
      tips: ['Harvest in morning'],
    }
  ],
};

const mockPlannerData: Partial<PlannerData> = {
  location: { climateZone: 'Tropical humid', lat: 0, lon: 0 }, // Example data
  growingSpace: 'Pots/Containers',
  experienceLevel: 'Intermediate',
};

const defaultPlantInstanceId = `${mockProduceData.id}_user123_testPlot`;

describe('StepByStepGuides Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockRouterPush.mockClear();
    mockToast.mockClear();
    mockGetPlantGrowProgress.mockClear();
    mockUpdateStageCompletion.mockClear();
    // Default mock implementation for getPlantGrowProgress
    mockGetPlantGrowProgress.mockReturnValue({ plantId: defaultPlantInstanceId, produceId: mockProduceData.id, completedStages: [] });
  });

  test('renders component with plant name and stage headers', () => {
    render(<StepByStepGuides produce={mockProduceData} plantInstanceId={defaultPlantInstanceId} />);
    expect(screen.getByText('Test Basil Growing Guide')).toBeInTheDocument();
    expect(screen.getByText(/Seed Starting/i)).toBeInTheDocument();
    expect(screen.getByText(/Vegetative Growth/i)).toBeInTheDocument();
    expect(screen.getByText(/Harvesting/i)).toBeInTheDocument();
  });

  test('accordion expands and collapses stage content', async () => {
    render(<StepByStepGuides produce={mockProduceData} plantInstanceId={defaultPlantInstanceId} />);
    const seedStartingHeader = screen.getByText(/Seed Starting/i);

    // Content should be visible initially for the first uncompleted stage (Seed Starting if mockGetPlantGrowProgress returns empty completedStages)
    // Let's assume Seed Starting is initially open (or click to open it)
    // For this test, we'll explicitly click to ensure it opens if not already.
    // The useEffect that auto-opens a stage might make this tricky, so ensure it's open.

    // Check if instructions for Seed Starting are visible (it should be open by default if it's the first uncompleted)
    // If not, click to open it.
    if (!screen.queryByText('Sow seeds')) {
         fireEvent.click(seedStartingHeader);
    }
    await screen.findByText('Sow seeds'); // Wait for animation or state update
    expect(screen.getByText('Sow seeds')).toBeVisible();

    // Now click to collapse
    fireEvent.click(seedStartingHeader);
    await waitFor(() => {
      expect(screen.queryByText('Sow seeds')).not.toBeVisible();
    });
  });

  test('"Mark as complete" toggle calls updateStageCompletion', () => {
    render(<StepByStepGuides produce={mockProduceData} plantInstanceId={defaultPlantInstanceId} />);
    // Assuming Seed Starting is open or can be opened
    const seedStartingHeader = screen.getByText(/Seed Starting/i);
    if (!screen.queryByText('Sow seeds')) { // If not open by default
        fireEvent.click(seedStartingHeader);
    }

    const markCompleteCheckbox = screen.getAllByRole('checkbox', { name: /Mark Stage as Complete/i })[0];
    fireEvent.click(markCompleteCheckbox);

    expect(mockUpdateStageCompletion).toHaveBeenCalledWith(
      defaultPlantInstanceId,
      mockProduceData.id,
      'Seed Starting', // stageName
      true // isComplete
    );
  });

  test('displays personalized tips based on plannerData', () => {
    render(
      <StepByStepGuides
        produce={mockProduceData}
        plantInstanceId={defaultPlantInstanceId}
        plannerData={mockPlannerData}
      />
    );
     // Assuming Seed Starting is open
    const seedStartingHeader = screen.getByText(/Seed Starting/i);
    if (!screen.queryByText('Sow seeds')) {
        fireEvent.click(seedStartingHeader);
    }

    expect(screen.getByText(/Climate Tip:/i)).toBeInTheDocument();
    expect(screen.getByText(/Space Tip:/i)).toBeInTheDocument();
    expect(screen.getByText(/Pro Tip:/i)).toBeInTheDocument();
  });

  test('Ask AI button navigates with correct context', () => {
    render(<StepByStepGuides produce={mockProduceData} plantInstanceId={defaultPlantInstanceId} />);
    // Open "Vegetative Growth" stage to find its AI button
    const vegetativeGrowthHeader = screen.getByText(/Vegetative Growth/i);
    fireEvent.click(vegetativeGrowthHeader);

    const askAiButton = screen.getAllByText(/Ask AI for Help with this Stage/i)[0]; // Assuming it's the one in the open section
    fireEvent.click(askAiButton);

    const expectedContextMessage = `I have a question about my ${mockProduceData.commonName} during the ${mockProduceData.growing_guide![1].stage} stage.`;
    expect(mockRouterPush).toHaveBeenCalledWith(`/chat?contextMessage=${encodeURIComponent(expectedContextMessage)}`);
  });

  test('image carousel displays and navigates for multiple images', async () => {
    render(<StepByStepGuides produce={mockProduceData} plantInstanceId={defaultPlantInstanceId} />);
    const seedStartingHeader = screen.getByText(/Seed Starting/i);
     if (!screen.queryByText('Sow seeds')) {
        fireEvent.click(seedStartingHeader); // Open Seed Starting which has 2 images
    }
    await screen.findByAltText('seed1.jpg'); // Wait for image to be potentially loaded

    expect(screen.getByAltText('seed1.jpg')).toBeVisible();
    const nextButton = screen.getByRole('button', { name: /next/i }); // Lucide icons might not have accessible name by default
    fireEvent.click(nextButton);

    await screen.findByAltText('seed2.jpg');
    expect(screen.getByAltText('seed2.jpg')).toBeVisible();
    expect(screen.queryByAltText('seed1.jpg')).not.toBeVisible();

    // Check for dot indicators
    const dots = screen.getAllByRole('button', { name: /go to image/i });
    expect(dots).toHaveLength(mockProduceData.growing_guide![0].media!.images!.length);
  });

  test('displays single image directly', async () => {
    render(<StepByStepGuides produce={mockProduceData} plantInstanceId={defaultPlantInstanceId} />);
    const vegetativeGrowthHeader = screen.getByText(/Vegetative Growth/i);
    fireEvent.click(vegetativeGrowthHeader); // Vegetative Growth has 1 image

    await screen.findByAltText('veg1.jpg');
    expect(screen.getByAltText('veg1.jpg')).toBeVisible();
    // Check that carousel controls are not present for single image
    expect(screen.queryByRole('button', { name: /next/i })).not.toBeInTheDocument();
  });

  test('video placeholder is displayed', async () => {
    render(<StepByStepGuides produce={mockProduceData} plantInstanceId={defaultPlantInstanceId} />);
    const vegetativeGrowthHeader = screen.getByText(/Vegetative Growth/i);
    fireEvent.click(vegetativeGrowthHeader); // Vegetative Growth has a video

    await screen.findByText(/Video available:/i);
    expect(screen.getByText('growth.mp4')).toBeInTheDocument();
  });

  test('reminders are displayed and simulate button calls toast', async () => {
    render(<StepByStepGuides produce={mockProduceData} plantInstanceId={defaultPlantInstanceId} />);
    const seedStartingHeader = screen.getByText(/Seed Starting/i);
     if (!screen.queryByText('Sow seeds')) {
        fireEvent.click(seedStartingHeader);
    }
    await screen.findByText('Check moisture daily');

    const simulateReminderButton = screen.getByRole('button', { name: /Simulate Reminder/i });
    fireEvent.click(simulateReminderButton);
    expect(mockToast).toHaveBeenCalledWith({
      title: `Reminder for ${mockProduceData.commonName}`,
      description: 'Check moisture daily',
    });
  });

  test('micro-tips and warnings are displayed correctly', async () => {
    render(<StepByStepGuides produce={mockProduceData} plantInstanceId={defaultPlantInstanceId} />);
    const seedStartingHeader = screen.getByText(/Seed Starting/i);
     if (!screen.queryByText('Sow seeds')) {
        fireEvent.click(seedStartingHeader);
    }
    await screen.findByText('Use warm water'); // Tip from Seed Starting
    expect(screen.getByText(/Quick Tip/i)).toBeInTheDocument();

    // Test collapsible warning in Vegetative Growth
    const vegetativeGrowthHeader = screen.getByText(/Vegetative Growth/i);
    fireEvent.click(vegetativeGrowthHeader); // Open this stage
    await screen.findByText(/Heads Up!/i); // Collapsible warning title

    const warningTitle = screen.getByText(/Heads Up!/i);
    expect(screen.queryByText('Do not overfertilize')).not.toBeVisible(); // Initially collapsed

    fireEvent.click(warningTitle); // Click to expand
    await screen.findByText('Do not overfertilize');
    expect(screen.getByText('Do not overfertilize')).toBeVisible();
  });

});

// Helper to deal with Framer Motion animations if they cause issues
// jest.mock('framer-motion', () => {
//   const actual = jest.requireActual('framer-motion');
//   return {
//     ...actual,
//     AnimatePresence: ({ children }) => <>{children}</>,
//     motion: {
//       ...actual.motion,
//       div: ({ children, ...props }) => <div {...props}>{children}</div>,
//       section: ({ children, ...props }) => <section {...props}>{children}</section>,
//       // Add other motion components if needed
//     },
//   };
// });
