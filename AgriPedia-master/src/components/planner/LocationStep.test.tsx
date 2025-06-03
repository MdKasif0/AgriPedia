import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import LocationStep from './LocationStep'; // Assuming test file is in the same directory

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ...jest.requireActual('lucide-react'), // Import and retain default behavior
  MapPin: () => <svg data-testid="map-pin-icon" />,
  Search: () => <svg data-testid="search-icon" />,
}));

// Mock UI components if they are simple passthroughs or to avoid complexities
// For this test, we'll let them render as is, but this is an option.
// jest.mock('@/components/ui/button', () => ({ children, ...props }) => <button {...props}>{children}</button>);
// jest.mock('@/components/ui/input', () => (props) => <input {...props} />);

describe('LocationStep', () => {
  const mockOnNext = jest.fn();
  const mockOnBack = jest.fn();
  const initialData = {};

  // Mock navigator.geolocation
  const mockGeolocation = {
    getCurrentPosition: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Assign to window.navigator for the tests
    Object.defineProperty(global.navigator, 'geolocation', {
      value: mockGeolocation,
      configurable: true,
    });
    mockGeolocation.getCurrentPosition.mockImplementation((successCallback) =>
      successCallback({ coords: { latitude: 51.5074, longitude: 0.1278 } })
    );
  });

  afterEach(() => {
    // Clean up the mock after each test
    Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        configurable: true,
      });
  });

  it('renders correctly with initial elements', () => {
    render(<LocationStep onNext={mockOnNext} onBack={mockOnBack} data={initialData} />);
    expect(screen.getByText(/Where are you planning to grow?/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., 123 Main St, Anytown/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Use My Current Location/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Back/i })).toBeInTheDocument();
  });

  it('allows manual address input, search, and calls onNext', async () => {
    render(<LocationStep onNext={mockOnNext} onBack={mockOnBack} data={initialData} />);
    const input = screen.getByPlaceholderText(/e.g., 123 Main St, Anytown/i);

    fireEvent.change(input, { target: { value: 'Test Address' } });
    expect(input).toHaveValue('Test Address');

    // Simulate manual search button click
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));

    // Wait for potential state updates if search is async or sets loading (even if mocked)
    await waitFor(() => {
      // Check if the displayed address has updated based on manual search
      expect(screen.getByText(/Selected Location: Test Address/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(mockOnNext).toHaveBeenCalledWith({
      location: expect.objectContaining({
        address: 'Test Address',
        climateZone: 'Varies (Placeholder)', // As per current implementation
      }),
    });
  });

  it('handles "Use My Current Location" button click, geolocation success, and calls onNext', async () => {
    render(<LocationStep onNext={mockOnNext} onBack={mockOnBack} data={initialData} />);

    fireEvent.click(screen.getByRole('button', { name: /Use My Current Location/i }));

    expect(screen.getByText(/Detecting.../i)).toBeInTheDocument(); // Loading state

    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText(/Coordinates: 51.51, 0.13/i)).toBeInTheDocument();
      expect(screen.getByText(/Selected Location: Coordinates: 51.51, 0.13/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(mockOnNext).toHaveBeenCalledWith({
      location: expect.objectContaining({
        lat: 51.5074,
        lon: 0.1278,
        address: 'Coordinates: 51.5074, 0.1278', // Exact formatting from component
        climateZone: 'Temperate (Placeholder)',
      }),
    });
  });

  it('handles geolocation error and displays error message', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((successCallback, errorCallback) =>
      errorCallback({ message: 'User denied Geolocation' })
    );

    render(<LocationStep onNext={mockOnNext} onBack={mockOnBack} data={initialData} />);
    fireEvent.click(screen.getByRole('button', { name: /Use My Current Location/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error detecting location: User denied Geolocation/i)).toBeInTheDocument();
    });

    // Next button should be enabled, but location data might be incomplete or error shown
    // Depending on desired behavior, you might check that onNext is not called with location data
    // or that it's called with empty/error state if that's how it's designed.
    // For now, just checking error message is fine.
    const nextButton = screen.getByRole('button', { name: /Next/i });
    expect(nextButton).not.toBeDisabled(); // Or check if it should be disabled based on requirements
  });

  it('calls onBack when the "Back" button is clicked', () => {
    render(<LocationStep onNext={mockOnNext} onBack={mockOnBack} data={initialData} />);
    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('initializes with and displays data from props', () => {
    const existingData = {
      location: {
        lat: 12.34,
        lon: 56.78,
        address: 'Existing Address',
        climateZone: 'Tropical (Test)',
      },
    };
    render(<LocationStep onNext={mockOnNext} onBack={mockOnBack} data={existingData} />);

    expect(screen.getByPlaceholderText(/e.g., 123 Main St, Anytown/i)).toHaveValue('Existing Address');
    expect(screen.getByText(/Selected Location: Existing Address/i)).toBeInTheDocument();
    expect(screen.getByText(/Coordinates: Lat: 12.3400, Lon: 56.7800/i)).toBeInTheDocument();
    expect(screen.getByText(/Climate Zone: Tropical \(Test\)/i)).toBeInTheDocument();
  });

  it('disables Next button if no address is available', () => {
    render(<LocationStep onNext={mockOnNext} onBack={mockOnBack} data={{ location: { address: '' } }} />);
    // Clear any default address that might be set by useEffect if data.location is empty but present
    const input = screen.getByPlaceholderText(/e.g., 123 Main St, Anytown/i);
    fireEvent.change(input, { target: { value: '' } }); // Ensure input is empty

    // If there's a "Search" button that sets the address, we need to consider its state.
    // The condition is `!locationInfo.address && !manualAddress`
    // So if manualAddress is also empty, it should be disabled.

    expect(screen.getByRole('button', { name: /Next/i })).toBeDisabled();
  });

  it('enables Next button if an address is present', async () => {
    render(<LocationStep onNext={mockOnNext} onBack={mockOnBack} data={initialData} />);
    const input = screen.getByPlaceholderText(/e.g., 123 Main St, Anytown/i);
    fireEvent.change(input, { target: { value: 'New Address' } });
     fireEvent.click(screen.getByRole('button', { name: /Search/i })); // Simulate search to update locationInfo

    await waitFor(() => {
        expect(screen.getByRole('button', { name: /Next/i })).not.toBeDisabled();
    });
  });

});
