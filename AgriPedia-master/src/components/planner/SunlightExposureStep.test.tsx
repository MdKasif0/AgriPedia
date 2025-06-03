import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SunlightExposureStep from './SunlightExposureStep';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  Sun: () => <svg data-testid="sun-icon" />,
  SunMedium: () => <svg data-testid="sun-medium-icon" />,
  CloudSun: () => <svg data-testid="cloud-sun-icon" />,
}));

// Mock TooltipProvider as it might wrap the component or cause issues if not handled
jest.mock('@/components/ui/tooltip', () => ({
  ...jest.requireActual('@/components/ui/tooltip'), // Keep other exports
  TooltipProvider: ({ children }) => <>{children}</>, // Simple passthrough
  Tooltip: ({ children }) => <>{children}</>, // Passthrough
  TooltipTrigger: ({ children, asChild }) => asChild ? children : <button>{children}</button>, // Basic trigger
  TooltipContent: ({ children }) => <div data-testid="tooltip-content" style={{display: 'none'}}>{children}</div>, // Hidden by default
}));


describe('SunlightExposureStep', () => {
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();
  const sunlightOptions = [
    { id: 'low', label: 'Low Light', description: 'Minimal direct sun (2-4 hours)' },
    { id: 'partial', label: 'Partial Sun', description: 'Some direct sun (4-6 hours)' },
    { id: 'full', label: 'Full Sun', description: 'Plenty of direct sun (6+ hours)' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with options', () => {
    render(<SunlightExposureStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    expect(screen.getByText(/How much sunlight does the area get?/i)).toBeInTheDocument();
    sunlightOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
      expect(screen.getByText(option.description)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
  });

  it('allows selecting an option and calls onNext', () => {
    render(<SunlightExposureStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    // The text 'Full Sun' is part of a button
    const fullSunButton = screen.getByText('Full Sun').closest('button');
    expect(fullSunButton).toBeInTheDocument();
    fireEvent.click(fullSunButton);

    expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(mockOnNext).toHaveBeenCalledWith({ sunlightExposure: 'full' });
  });

  it('calls onBack when back button is clicked', () => {
    render(<SunlightExposureStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('initializes with and highlights data from props', () => {
    render(<SunlightExposureStep onNext={mockOnNext} onBack={mockOnBack} data={{ sunlightExposure: 'partial' }} />);
    const partialSunButton = screen.getByText('Partial Sun').closest('button');
    expect(partialSunButton).toHaveClass('ring-amber-500'); // Based on current implementation
    expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled();
  });

  // Basic Tooltip Test: Check if tooltip content is present (though not necessarily visible without hover)
  // More advanced tooltip testing requires simulating hover/focus which can be tricky.
  it('renders tooltip content for options', async () => {
    render(<SunlightExposureStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    // Example: Check detailed guide for "Low Light" is in the document (even if hidden)
    // This tests that TooltipContent is receiving the prop, not that it's visible.
    // Note: The mock for TooltipContent hides it. To test visibility, the mock would need to change display on hover/focus.
    // For simplicity, we'll check for the text's existence.
    const lowLightDetailedGuide = "Ideal for shade-tolerant plants like leafy greens (e.g., lettuce, spinach) or many indoor houseplants.";
    // All TooltipContent components are rendered, so we find all and check if any contain the text.
    const allTooltipContents = screen.getAllByTestId('tooltip-content');
    expect(allTooltipContents.some(node => node.textContent.includes(lowLightDetailedGuide))).toBe(true);
  });
});
