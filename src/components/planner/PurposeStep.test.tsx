import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PurposeStep from './PurposeStep';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  Carrot: () => <svg data-testid="carrot-icon" />,
  Leaf: () => <svg data-testid="leaf-icon" />,
  Grape: () => <svg data-testid="grape-icon" />,
  Flower2: () => <svg data-testid="flower2-icon" />, // Corrected name if it was Flower in component
  HeartPulse: () => <svg data-testid="heartpulse-icon" />,
  ShieldCheck: () => <svg data-testid="shieldcheck-icon" />,
}));

import type { PlannerData, StepProps } from '@/types/planner';

describe('PurposeStep', () => {
  const mockOnDataChange: jest.MockedFunction<(updatedData: Partial<PlannerData>) => void> = jest.fn();
  const purposeOptionsLabels = ['Vegetables', 'Herbs', 'Fruits', 'Flowers', 'Medicinal', 'Pet-Safe Plants']; // Updated Pet-Safe label

  const defaultProps: StepProps = {
    data: {},
    onDataChange: mockOnDataChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with options', () => {
    render(<PurposeStep {...defaultProps} />);
    expect(screen.getByText(/What are your gardening goals?/i)).toBeInTheDocument();
    purposeOptionsLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('allows selecting multiple options and calls onDataChange with an array of selections', () => {
    render(<PurposeStep {...defaultProps} />);

    const vegetablesButton = screen.getByText('Vegetables').closest('button');
    if (!vegetablesButton) throw new Error("Vegetables button not found");
    const herbsButton = screen.getByText('Herbs').closest('button');
    if (!herbsButton) throw new Error("Herbs button not found");

    fireEvent.click(vegetablesButton);
    expect(mockOnDataChange).toHaveBeenCalledWith({ purpose: ['vegetables'] });

    fireEvent.click(herbsButton);
    expect(mockOnDataChange).toHaveBeenCalledWith({ purpose: ['vegetables', 'herbs'] });


    // Check selection styling
    expect(vegetablesButton).toHaveClass('ring-blue-500');
    expect(herbsButton).toHaveClass('ring-blue-500');
  });

  it('allows deselecting an option', () => {
    render(<PurposeStep {...defaultProps} data={{ purpose: ['vegetables']}} />);
    const vegetablesButton = screen.getByText('Vegetables').closest('button');
    if (!vegetablesButton) throw new Error("Vegetables button not found");

    // Pre-selected from props
    expect(vegetablesButton).toHaveClass('ring-blue-500');

    // Deselect
    fireEvent.click(vegetablesButton);
    expect(vegetablesButton).not.toHaveClass('ring-blue-500');
    expect(mockOnDataChange).toHaveBeenCalledWith({ purpose: [] });
  });


  it('initializes with and highlights data from props', () => {
    const initialPurposes = ['fruits', 'flowers'];
    render(<PurposeStep data={{ purpose: initialPurposes }} onDataChange={mockOnDataChange} />);

    const fruitsButton = screen.getByText('Fruits').closest('button');
    const flowersButton = screen.getByText('Flowers').closest('button');
    const vegetablesButton = screen.getByText('Vegetables').closest('button');

    expect(fruitsButton).toHaveClass('ring-blue-500');
    expect(flowersButton).toHaveClass('ring-blue-500');
    expect(vegetablesButton).not.toHaveClass('ring-blue-500');
  });

  it('updates selection when data prop changes', () => {
    const { rerender } = render(<PurposeStep data={{ purpose: ['herbs'] }} onDataChange={mockOnDataChange} />);
    const herbsButton = screen.getByText('Herbs').closest('button');
    expect(herbsButton).toHaveClass('ring-blue-500');

    rerender(<PurposeStep data={{ purpose: ['vegetables', 'medicinal'] }} onDataChange={mockOnDataChange} />);
    const vegetablesButton = screen.getByText('Vegetables').closest('button');
    const medicinalButton = screen.getByText('Medicinal').closest('button');
    expect(vegetablesButton).toHaveClass('ring-blue-500');
    expect(medicinalButton).toHaveClass('ring-blue-500');
    expect(herbsButton).not.toHaveClass('ring-blue-500');
  });
});
