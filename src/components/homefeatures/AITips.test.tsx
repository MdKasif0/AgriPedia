import { render, screen } from '@testing-library/react';
import AITips from './AITips';

describe('AITips', () => {
  it('renders the component', () => {
    render(<AITips />);
    expect(screen.getByText('AI-Powered Tips')).toBeInTheDocument();
    expect(screen.getByText('Personalized advice to help your garden thrive.')).toBeInTheDocument();
    // Check for the default tip text
    expect(screen.getByText('Your basil may need more sunlight. Try moving it to a sunnier spot.')).toBeInTheDocument();
  });
});
