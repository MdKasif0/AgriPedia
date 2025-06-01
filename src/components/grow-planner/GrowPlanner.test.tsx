import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '@/components/providers/ThemeProvider'; // Adjust path if needed
import GrowPlanner from './GrowPlanner';
import { TooltipProvider } from '@/components/ui/tooltip'; // Required by Step3

// Mock child components to isolate GrowPlanner logic for some tests if needed,
// or allow them to render for integration-style tests.
// For now, we'll let them render to test navigation.

// Mock framer-motion
jest.mock('framer-motion', () => {
  const FakeFragment = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  FakeFragment.displayName = 'motion.div';
  return {
    motion: {
      div: FakeFragment,
    },
    AnimatePresence: FakeFragment, // if you use AnimatePresence
  };
});

describe('GrowPlanner Component', () => {
  const renderGrowPlanner = () => {
    return render(
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider> {/* Step 3 uses Tooltip */}
          <GrowPlanner />
        </TooltipProvider>
      </ThemeProvider>
    );
  };

  test('should render Step 1 (Location) by default', () => {
    renderGrowPlanner();
    expect(screen.getByText(/Step 1: Location/i)).toBeInTheDocument();
    expect(screen.getByText(/Latitude/i)).toBeInTheDocument();
    expect(screen.getByText(/Longitude/i)).toBeInTheDocument();
  });

  test('"Previous" button should be disabled on Step 1', () => {
    renderGrowPlanner();
    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled();
  });

  test('clicking "Next" should advance to Step 2', () => {
    renderGrowPlanner();
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByText(/Step 2: What type of growing space do you have?/i)).toBeInTheDocument();
    // Previous button should now be enabled
    expect(screen.getByRole('button', { name: /Previous/i })).toBeEnabled();
  });

  test('navigation through all steps to summary and start over', async () => {
    renderGrowPlanner();

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    await screen.findByText(/Step 2: What type of growing space do you have?/i);
    expect(screen.getByText(/Step 2: What type of growing space do you have?/i)).toBeInTheDocument();

    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    await screen.findByText(/Step 3: How much sunlight does your space get?/i);
    expect(screen.getByText(/Step 3: How much sunlight does your space get?/i)).toBeInTheDocument();

    // Step 3 -> Step 4
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    await screen.findByText(/Step 4: What do you want to grow?/i);
    expect(screen.getByText(/Step 4: What do you want to grow?/i)).toBeInTheDocument();

    // Step 4 -> Step 5
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    await screen.findByText(/Step 5: How much time can you commit per week?/i);
    expect(screen.getByText(/Step 5: How much time can you commit per week?/i)).toBeInTheDocument();

    // Step 5 -> Step 6
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    await screen.findByText(/Step 6: What's your gardening experience level?/i);
    expect(screen.getByText(/Step 6: What's your gardening experience level?/i)).toBeInTheDocument();

    // Check "Next" button text changes to "See Summary"
    expect(screen.getByRole('button', { name: /See Summary/i })).toBeInTheDocument();

    // Step 6 -> Summary (Step 7)
    fireEvent.click(screen.getByRole('button', { name: /See Summary/i }));
    await screen.findByText(/Step 7: Your Personalized Plan Summary/i);
    expect(screen.getByText(/Step 7: Your Personalized Plan Summary/i)).toBeInTheDocument();

    // On Summary step, "Start Over" button should be present
    const startOverButton = screen.getByRole('button', { name: /Start Over/i });
    expect(startOverButton).toBeInTheDocument();
    // "Previous" button should take back to Step 6
    fireEvent.click(screen.getByRole('button', { name: /Previous/i }));
    await screen.findByText(/Step 6: What's your gardening experience level?/i);
    expect(screen.getByText(/Step 6: What's your gardening experience level?/i)).toBeInTheDocument();

    // Go back to summary
    fireEvent.click(screen.getByRole('button', { name: /See Summary/i }));
    await screen.findByText(/Step 7: Your Personalized Plan Summary/i);

    // Click "Start Over"
    fireEvent.click(screen.getByRole('button', { name: /Start Over/i }));
    await screen.findByText(/Step 1: Location/i); // Should be back to Step 1
    expect(screen.getByText(/Step 1: Location/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Previous/i })).toBeDisabled(); // Previous disabled on Step 1
  });
});
