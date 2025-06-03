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

describe('PurposeStep', () => {
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();
  const purposeOptionsLabels = ['Vegetables', 'Herbs', 'Fruits', 'Flowers', 'Medicinal', 'Pet-Safe'];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with options', () => {
    render(<PurposeStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    expect(screen.getByText(/What are your gardening goals?/i)).toBeInTheDocument();
    purposeOptionsLabels.forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
  });

  it('allows selecting multiple options and calls onNext with an array of selections', () => {
    render(<PurposeStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);

    const vegetablesButton = screen.getByText('Vegetables').closest('button');
    const herbsButton = screen.getByText('Herbs').closest('button');

    fireEvent.click(vegetablesButton);
    fireEvent.click(herbsButton);

    // Check selection styling (example for one button)
    expect(vegetablesButton).toHaveClass('ring-blue-500');
    expect(herbsButton).toHaveClass('ring-blue-500');

    expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(mockOnNext).toHaveBeenCalledWith({ purposes: ['vegetables', 'herbs'] });
  });

  it('allows deselecting an option', () => {
    render(<PurposeStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    const vegetablesButton = screen.getByText('Vegetables').closest('button');

    // Select
    fireEvent.click(vegetablesButton);
    expect(vegetablesButton).toHaveClass('ring-blue-500');
    expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled();

    // Deselect
    fireEvent.click(vegetablesButton);
    expect(vegetablesButton).not.toHaveClass('ring-blue-500');
    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled(); // Assuming it becomes disabled if empty

    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    // onNext should not be called if no items are selected and button is disabled
    expect(mockOnNext).not.toHaveBeenCalled();
  });


  it('calls onBack when back button is clicked', () => {
    render(<PurposeStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('initializes with and highlights data from props', () => {
    const initialPurposes = ['fruits', 'flowers'];
    render(<PurposeStep onNext={mockOnNext} onBack={mockOnBack} data={{ purposes: initialPurposes }} />);

    const fruitsButton = screen.getByText('Fruits').closest('button');
    const flowersButton = screen.getByText('Flowers').closest('button');
    const vegetablesButton = screen.getByText('Vegetables').closest('button');

    expect(fruitsButton).toHaveClass('ring-blue-500');
    expect(flowersButton).toHaveClass('ring-blue-500');
    expect(vegetablesButton).not.toHaveClass('ring-blue-500');

    expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(mockOnNext).toHaveBeenCalledWith({ purposes: initialPurposes });
  });
});
