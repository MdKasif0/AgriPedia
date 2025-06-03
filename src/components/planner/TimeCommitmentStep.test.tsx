import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimeCommitmentStep from './TimeCommitmentStep';
import { commitmentLevels } from './TimeCommitmentStep';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  Clock3: () => <svg data-testid="clock3-icon" />,
  Zap: () => <svg data-testid="zap-icon" />,
}));

// Mock the Slider component from ShadCN/UI
// This basic mock allows us to simulate value changes.
// A more complex mock might be needed if specific slider interactions are tested.
jest.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, ...props }) => (
    <input
      type="range"
      data-testid="slider"
      min={props.min}
      max={props.max}
      step={props.step}
      value={value ? value[0] : props.defaultValue[0]} // Handle controlled/uncontrolled from mock perspective
      onChange={(e) => onValueChange([parseInt(e.target.value, 10)])}
    />
  ),
}));

describe('TimeCommitmentStep', () => {
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with slider and default level', () => {
    render(<TimeCommitmentStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    expect(screen.getByText(/How much time can you dedicate per week?/i)).toBeInTheDocument();
    expect(screen.getByTestId('slider')).toBeInTheDocument();

    // Default is Moderate (value 3)
    expect(screen.getByText('Moderate')).toBeInTheDocument();
    expect(screen.getByText(commitmentLevels[2].description)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled(); // Next should be enabled by default
  });

  it('updates displayed level when slider value changes', () => {
    render(<TimeCommitmentStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    const slider = screen.getByTestId('slider');

    fireEvent.change(slider, { target: { value: '5' } }); // "Very High"

    expect(screen.getByText('Very High')).toBeInTheDocument();
    expect(screen.getByText(commitmentLevels[4].description)).toBeInTheDocument();
  });

  it('calls onNext with the selected commitment value', () => {
    render(<TimeCommitmentStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    const slider = screen.getByTestId('slider');
    fireEvent.change(slider, { target: { value: '4' } }); // "High"

    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(mockOnNext).toHaveBeenCalledWith({ timeCommitment: 4 });
  });

  it('calls onBack when back button is clicked', () => {
    render(<TimeCommitmentStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('initializes with data from props and displays corresponding level', () => {
    render(<TimeCommitmentStep onNext={mockOnNext} onBack={mockOnBack} data={{ timeCommitment: 1 }} />); // "Minimal"

    // Use a more specific query to find the text
    expect(screen.getByText((content, element) => {
      return element?.tagName.toLowerCase() === 'p' && content === 'Minimal';
    })).toBeInTheDocument();
    
    expect(screen.getByText(commitmentLevels[0].description)).toBeInTheDocument();
    expect(screen.getByTestId('slider')).toHaveValue('1');

    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(mockOnNext).toHaveBeenCalledWith({ timeCommitment: 1 });
  });
});
