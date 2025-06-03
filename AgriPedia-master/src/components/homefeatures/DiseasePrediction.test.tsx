import { render, screen } from '@testing-library/react';
import DiseasePrediction from './DiseasePrediction';

describe('DiseasePrediction', () => {
  it('renders the component', () => {
    render(<DiseasePrediction />);
    expect(screen.getByText('Disease Prediction')).toBeInTheDocument();
    expect(screen.getByText('Scan a leaf or soil to detect issues early.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Scan Now/i })).toBeInTheDocument();
  });
});
