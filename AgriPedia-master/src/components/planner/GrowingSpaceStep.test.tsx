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

describe('GrowingSpaceStep', () => {
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();
  const spaceOptions = [
    { id: 'indoor', label: 'Indoor' },
    { id: 'balcony', label: 'Balcony' },
    { id: 'small_yard', label: 'Small Yard' },
    { id: 'large_garden', label: 'Large Garden' },
    { id: 'greenhouse', label: 'Greenhouse' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with options', () => {
    render(<GrowingSpaceStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    expect(screen.getByText(/What kind of space are you working with?/i)).toBeInTheDocument();
    spaceOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled(); // Initially disabled
  });

  it('allows selecting an option and calls onNext', () => {
    render(<GrowingSpaceStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    const balconyOption = screen.getByText('Balcony'); // Button role is implicit for these clickable cards
    fireEvent.click(balconyOption);

    // Check if selection styling is applied (optional, depends on DOM structure for selection)
    // For example, if a class 'selected' is added:
    // expect(balconyOption.closest('button')).toHaveClass('ring-2'); // Example check

    expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(mockOnNext).toHaveBeenCalledWith({ growingSpace: 'balcony' });
  });

  it('calls onBack when back button is clicked', () => {
    render(<GrowingSpaceStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('initializes with and highlights data from props', () => {
    render(<GrowingSpaceStep onNext={mockOnNext} onBack={mockOnBack} data={{ growingSpace: 'small_yard' }} />);
    // Check that 'Small Yard' is somehow marked as selected.
    // This requires knowing how selection is indicated (e.g., a specific class on the button or a child).
    // For example, if the button gets a ring:
    const smallYardButton = screen.getByText('Small Yard').closest('button');
    expect(smallYardButton).toHaveClass('ring-green-500'); // Based on current implementation's selected style

    expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled();
  });
});
