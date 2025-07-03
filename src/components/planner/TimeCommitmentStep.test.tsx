import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TimeCommitmentStep from './TimeCommitmentStep';
import type { PlannerData, StepProps } from '@/types/planner';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  Clock3: () => <svg data-testid="clock3-icon" />,
  Zap: () => <svg data-testid="zap-icon" />,
}));

// Mock the Slider component
jest.mock('@/components/ui/slider', () => ({
  Slider: ({ value, onValueChange, ...props }: { value: number[], onValueChange: (value: number[]) => void, [key: string]: any }) => (
    <input
      type="range"
      data-testid="slider"
      min={props.min}
      max={props.max}
      step={props.step}
      value={value ? value[0] : props.defaultValue ? props.defaultValue[0] : ''}
      onChange={(e) => onValueChange([parseInt(e.target.value, 10)])}
    />
  ),
}));

describe('TimeCommitmentStep', () => {
  const mockOnDataChange: jest.MockedFunction<(updatedData: Partial<PlannerData>) => void> = jest.fn();

  // Replicate or import definition from component to ensure test aligns with implementation
  const componentCommitmentLevels = [
    { value: 1, id: 'minimal', label: 'Minimal', description: '~1-2 hours/week (e.g., very low maintenance herbs)' },
    { value: 2, id: 'low', label: 'Low', description: '~2-4 hours/week (e.g., some hardy vegetables)' },
    { value: 3, id: 'moderate', label: 'Moderate', description: '~4-6 hours/week (e.g., a small mixed garden)' },
    { value: 4, id: 'high', label: 'High', description: '~6-8 hours/week (e.g., a larger, more diverse garden)' },
    { value: 5, id: 'very_high', label: 'Very High', description: '8+ hours/week (e.g., intensive gardening, greenhouse)' },
  ];

  const defaultProps: StepProps = {
    data: {},
    onDataChange: mockOnDataChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with slider and default level (Moderate)', () => {
    render(<TimeCommitmentStep {...defaultProps} />);
    expect(screen.getByText(/How much time can you dedicate per week?/i)).toBeInTheDocument();
    expect(screen.getByTestId('slider')).toBeInTheDocument();

    const moderateLevel = componentCommitmentLevels.find(l => l.id === 'moderate');
    expect(screen.getByText(moderateLevel!.label)).toBeInTheDocument();
    expect(screen.getByText(moderateLevel!.description)).toBeInTheDocument();
  });

  it('updates displayed level when slider value changes and calls onDataChange with string ID', () => {
    render(<TimeCommitmentStep {...defaultProps} />);
    const slider = screen.getByTestId('slider');

    fireEvent.change(slider, { target: { value: '5' } }); // Corresponds to 'very_high'

    const veryHighLevel = componentCommitmentLevels.find(l => l.value === 5);
    expect(screen.getByText(veryHighLevel!.label)).toBeInTheDocument();
    expect(screen.getByText(veryHighLevel!.description)).toBeInTheDocument();
    expect(mockOnDataChange).toHaveBeenCalledWith({ timeCommitment: 'very_high' });
  });

  it('initializes with data (string ID) from props and displays corresponding level', () => {
    // Pass the string ID 'minimal' as expected by PlannerData type
    render(<TimeCommitmentStep data={{ timeCommitment: 'minimal' }} onDataChange={mockOnDataChange} />);

    const minimalLevel = componentCommitmentLevels.find(l => l.id === 'minimal');
    expect(screen.getByText(minimalLevel!.label)).toBeInTheDocument();
    expect(screen.getByText(minimalLevel!.description)).toBeInTheDocument();
    // The slider's value attribute will be the numeric value
    expect(screen.getByTestId('slider')).toHaveValue(String(minimalLevel!.value));
  });

  it('updates slider when data prop (string ID) changes', () => {
    const { rerender } = render(<TimeCommitmentStep data={{ timeCommitment: 'low' }} onDataChange={mockOnDataChange} />);
    const lowLevelValue = componentCommitmentLevels.find(l => l.id === 'low')!.value;
    expect(screen.getByTestId('slider')).toHaveValue(String(lowLevelValue));

    rerender(<TimeCommitmentStep data={{ timeCommitment: 'high' }} onDataChange={mockOnDataChange} />);
    const highLevelValue = componentCommitmentLevels.find(l => l.id === 'high')!.value;
    expect(screen.getByTestId('slider')).toHaveValue(String(highLevelValue));
  });
});
