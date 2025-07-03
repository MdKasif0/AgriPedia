import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GrowingSpaceStep from './GrowingSpaceStep';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  Home: () => <svg data-testid="home-icon" />,
  Building: () => <svg data-testid="building-icon" />,
  Trees: () => <svg data-testid="trees-icon" />,
  Sprout: () => <svg data-testid="sprout-icon" />,
  Warehouse: () => <svg data-testid="warehouse-icon" />,
}));

import type { PlannerData, StepProps } from '@/types/planner';

describe('GrowingSpaceStep', () => {
  const mockOnDataChange: jest.MockedFunction<(updatedData: Partial<PlannerData>) => void> = jest.fn();
  // spaceOptions from the component itself, if needed for test verification:
  const componentSpaceOptions = [
    { id: 'indoors', label: 'Indoor' },
    { id: 'balcony', label: 'Balcony' },
    { id: 'outdoors_small', label: 'Small Yard/Patio' },
    { id: 'outdoors_large', label: 'Large Garden/Yard' },
    { id: 'greenhouse', label: 'Greenhouse' },
  ];

  const defaultProps: StepProps = {
    data: {},
    onDataChange: mockOnDataChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with options', () => {
    render(<GrowingSpaceStep {...defaultProps} />);
    expect(screen.getByText(/What kind of space are you working with?/i)).toBeInTheDocument();
    componentSpaceOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('allows selecting an option and calls onDataChange', () => {
    render(<GrowingSpaceStep {...defaultProps} />);
    const balconyButton = screen.getByText('Balcony').closest('button');
    if (!balconyButton) throw new Error("Balcony button not found");
    fireEvent.click(balconyButton);
    expect(mockOnDataChange).toHaveBeenCalledWith({ space: 'balcony' });
  });

  it('initializes with and highlights data from props', () => {
    render(<GrowingSpaceStep data={{ space: 'outdoors_small' }} onDataChange={mockOnDataChange} />);
    const smallYardButton = screen.getByText('Small Yard/Patio').closest('button');
    expect(smallYardButton).toHaveClass('ring-green-500');
  });

  it('updates selection when data prop changes', () => {
    const { rerender } = render(<GrowingSpaceStep data={{ space: 'indoors' }} onDataChange={mockOnDataChange} />);
    const indoorButton = screen.getByText('Indoor').closest('button');
    expect(indoorButton).toHaveClass('ring-green-500');

    rerender(<GrowingSpaceStep data={{ space: 'greenhouse' }} onDataChange={mockOnDataChange} />);
    const greenhouseButton = screen.getByText('Greenhouse').closest('button');
    expect(greenhouseButton).toHaveClass('ring-green-500');
    expect(indoorButton).not.toHaveClass('ring-green-500');
  });
});
