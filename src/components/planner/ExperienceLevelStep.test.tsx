import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExperienceLevelStep from './ExperienceLevelStep';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'),
  Baby: () => <svg data-testid="baby-icon" />,
  User: () => <svg data-testid="user-icon" />,
  Award: () => <svg data-testid="award-icon" />,
}));

import { StepProps, PlannerData } from '@/types/planner';

describe('ExperienceLevelStep', () => {
  const mockOnDataChange: jest.MockedFunction<(updatedData: Partial<PlannerData>) => void> = jest.fn();
  const experienceOptions = [
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
  ];

  const defaultProps: StepProps = {
    data: {},
    onDataChange: mockOnDataChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with options', () => {
    render(<ExperienceLevelStep {...defaultProps} />);
    expect(screen.getByText(/What's your gardening experience level?/i)).toBeInTheDocument();
    experienceOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
  });

  it('allows selecting an option and calls onDataChange', () => {
    render(<ExperienceLevelStep {...defaultProps} />);
    const advancedButton = screen.getByText('Advanced').closest('button');
    if (!advancedButton) throw new Error("Advanced button not found");
    fireEvent.click(advancedButton);

    expect(mockOnDataChange).toHaveBeenCalledWith({ experience: 'advanced' });
  });

  it('initializes with and highlights data from props', () => {
    render(<ExperienceLevelStep data={{ experience: 'intermediate' }} onDataChange={mockOnDataChange} />);
    const intermediateButton = screen.getByText('Intermediate').closest('button');
    expect(intermediateButton).toHaveClass('ring-purple-500'); // Based on current implementation's selected style
  });

  it('updates selection when data prop changes', () => {
    const { rerender } = render(<ExperienceLevelStep data={{ experience: 'beginner' }} onDataChange={mockOnDataChange} />);
    const beginnerButton = screen.getByText('Beginner').closest('button');
    expect(beginnerButton).toHaveClass('ring-purple-500');

    rerender(<ExperienceLevelStep data={{ experience: 'advanced' }} onDataChange={mockOnDataChange} />);
    const advancedButton = screen.getByText('Advanced').closest('button');
    expect(advancedButton).toHaveClass('ring-purple-500');
    expect(beginnerButton).not.toHaveClass('ring-purple-500');
  });
});
