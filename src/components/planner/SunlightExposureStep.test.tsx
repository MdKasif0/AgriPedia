import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SunlightExposureStep from './SunlightExposureStep';

import type { PlannerData, StepProps } from '@/types/planner';

// Mock lucide-react icons (ensure this is correctly typed or adjust as needed)
jest.mock('lucide-react', () => {
  const original = jest.requireActual('lucide-react');
  return {
    ...original,
    Sun: () => <svg data-testid="sun-icon" />,
    SunMedium: () => <svg data-testid="sun-medium-icon" />,
    CloudSun: () => <svg data-testid="cloud-sun-icon" />,
  };
});


// Mock TooltipProvider as it might wrap the component or cause issues if not handled
jest.mock('@/components/ui/tooltip', () => {
  const original = jest.requireActual('@/components/ui/tooltip');
  return {
    ...original,
    TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    TooltipTrigger: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (asChild ? children : <button>{children}</button>),
    TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content" style={{display: 'none'}}>{children}</div>,
  };
});


describe('SunlightExposureStep', () => {
  const mockOnDataChange: jest.MockedFunction<(updatedData: Partial<PlannerData>) => void> = jest.fn();

  const componentSunlightOptions = [
    { id: 'shade', label: 'Shade', description: 'Minimal direct sun (less than 4 hours)', detailedGuide: 'Ideal for shade-tolerant plants like leafy greens (e.g., lettuce, spinach) or many indoor houseplants.' },
    { id: 'partial', label: 'Partial Sun', description: 'Some direct sun (4-6 hours)', detailedGuide: 'Suitable for root vegetables (e.g., carrots, beets) and brassicas (e.g., broccoli, kale) that benefit from some afternoon shade in hot climates.' },
    { id: 'full', label: 'Full Sun', description: 'Plenty of direct sun (6+ hours)', detailedGuide: 'Perfect for sun-loving, fruit-bearing plants like tomatoes, peppers, cucumbers, and squash, as well as herbs like basil and rosemary.' },
  ];

  const defaultProps: StepProps = {
    data: {},
    onDataChange: mockOnDataChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with options', () => {
    render(<SunlightExposureStep {...defaultProps} />);
    expect(screen.getByText(/How much sunlight does the area get?/i)).toBeInTheDocument();
    componentSunlightOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
      expect(screen.getByText(option.description)).toBeInTheDocument();
    });
  });

  it('allows selecting an option and calls onDataChange', () => {
    render(<SunlightExposureStep {...defaultProps} />);
    const fullSunButton = screen.getByText('Full Sun').closest('button');
    if (!fullSunButton) throw new Error("Full Sun button not found");
    fireEvent.click(fullSunButton);

    expect(mockOnDataChange).toHaveBeenCalledWith({ sunlight: 'full' });
  });


  it('initializes with and highlights data from props', () => {
    render(<SunlightExposureStep data={{ sunlight: 'partial' }} onDataChange={mockOnDataChange} />);
    const partialSunButton = screen.getByText('Partial Sun').closest('button');
    expect(partialSunButton).toHaveClass('ring-amber-500');
  });

  it('updates selection when data prop changes', () => {
    const { rerender } = render(<SunlightExposureStep data={{ sunlight: 'shade' }} onDataChange={mockOnDataChange} />);
    const shadeButton = screen.getByText('Shade').closest('button');
    expect(shadeButton).toHaveClass('ring-amber-500');

    rerender(<SunlightExposureStep data={{ sunlight: 'full' }} onDataChange={mockOnDataChange} />);
    const fullSunButton = screen.getByText('Full Sun').closest('button');
    expect(fullSunButton).toHaveClass('ring-amber-500');
    expect(shadeButton).not.toHaveClass('ring-amber-500');
  });

  it('renders tooltip content for options', async () => {
    render(<SunlightExposureStep {...defaultProps} />);
    const shadeDetailedGuide = componentSunlightOptions.find(opt => opt.id === 'shade')?.detailedGuide;
    const allTooltipContents = screen.getAllByTestId('tooltip-content');
    expect(allTooltipContents.some(node => node.textContent?.includes(shadeDetailedGuide || ''))).toBe(true);
  });
});
