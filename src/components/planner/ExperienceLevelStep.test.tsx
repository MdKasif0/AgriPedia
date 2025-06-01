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

describe('ExperienceLevelStep', () => {
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();
  const experienceOptions = [
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with options and "Finish" button', () => {
    render(<ExperienceLevelStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    expect(screen.getByText(/What's your gardening experience level?/i)).toBeInTheDocument();
    experienceOptions.forEach(option => {
      expect(screen.getByText(option.label)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Finish/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Finish/i })).toBeDisabled(); // Initially disabled
  });

  it('allows selecting an option and calls onNext with "Finish"', () => {
    render(<ExperienceLevelStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    // The text 'Advanced' is part of a button
    const advancedButton = screen.getByText('Advanced').closest('button');
    expect(advancedButton).toBeInTheDocument();
    fireEvent.click(advancedButton);

    expect(screen.getByRole('button', { name: /Finish/i })).not.toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /Finish/i }));
    expect(mockOnNext).toHaveBeenCalledWith({ experienceLevel: 'advanced' });
  });

  it('calls onBack when back button is clicked', () => {
    render(<ExperienceLevelStep onNext={mockOnNext} onBack={mockOnBack} data={{}} />);
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('initializes with and highlights data from props', () => {
    render(<ExperienceLevelStep onNext={mockOnNext} onBack={mockOnBack} data={{ experienceLevel: 'intermediate' }} />);
    const intermediateButton = screen.getByText('Intermediate').closest('button');
    expect(intermediateButton).toHaveClass('ring-purple-500'); // Based on current implementation's selected style

    expect(screen.getByRole('button', { name: /Finish/i })).not.toBeDisabled();
  });
});
