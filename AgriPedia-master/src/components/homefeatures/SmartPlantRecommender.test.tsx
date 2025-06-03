import { render, screen } from '@testing-library/react';
import SmartPlantRecommender from './SmartPlantRecommender';

describe('SmartPlantRecommender', () => {
  it('renders the component', () => {
    render(<SmartPlantRecommender />);
    expect(screen.getByText('Smart Plant Recommender')).toBeInTheDocument();
    expect(screen.getByText('Get plant suggestions tailored to your space and goals.')).toBeInTheDocument();
  });
});
