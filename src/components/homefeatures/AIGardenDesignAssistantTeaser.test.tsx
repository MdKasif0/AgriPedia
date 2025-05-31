import { render, screen } from '@testing-library/react';
import AIGardenDesignAssistantTeaser from './AIGardenDesignAssistantTeaser';

describe('AIGardenDesignAssistantTeaser', () => {
  it('renders the component', () => {
    render(<AIGardenDesignAssistantTeaser />);
    expect(screen.getByText('AI Garden Design Assistant')).toBeInTheDocument();
    expect(screen.getByText('Visualize and plan your dream garden with AI.')).toBeInTheDocument();
    expect(screen.getByText('Coming Soon!')).toBeInTheDocument();
  });
});
