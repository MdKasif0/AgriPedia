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

import type { PlannerData, StepProps } from '@/types/planner';

describe('LocationStep', () => {
  const mockOnDataChange: jest.MockedFunction<(updatedData: Partial<PlannerData>) => void> = jest.fn();
  const initialData: Partial<PlannerData> = {};

  const defaultProps: StepProps = {
    data: initialData,
    onDataChange: mockOnDataChange,
  };

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
    render(<LocationStep {...defaultProps} />);
    expect(screen.getByText(/Where are you planning to grow?/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., 123 Main St, Anytown/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Use My Current Location/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
    // "Next" and "Back" buttons are not part of LocationStep itself
  });

  it('allows manual address input, search, and calls onDataChange', async () => {
    render(<LocationStep {...defaultProps} />);
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

    expect(mockOnDataChange).toHaveBeenCalledWith({
      location: expect.objectContaining({
        address: 'Test Address',
        climateZone: 'Varies (Placeholder)', // As per current implementation
        simplifiedClimate: 'Varies (Placeholder)',
      }),
    });
  });

  it('handles "Use My Current Location" button click, geolocation success, and calls onDataChange', async () => {
    render(<LocationStep {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Use My Current Location/i }));

    expect(screen.getByText(/Detecting.../i)).toBeInTheDocument(); // Loading state

    await waitFor(() => {
      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText(/Coordinates: 51.51, 0.13/i)).toBeInTheDocument();
      expect(screen.getByText(/Selected Location: Coordinates: 51.51, 0.13/i)).toBeInTheDocument();
    });

    expect(mockOnDataChange).toHaveBeenCalledWith({
      location: expect.objectContaining({
        lat: 51.5074,
        lon: 0.1278,
        address: 'Coordinates: 51.5074, 0.1278',
        climateZone: 'Temperate (Placeholder)',
        simplifiedClimate: 'Temperate (Placeholder)',
      }),
    });
  });

  it('handles geolocation error and displays error message', async () => {
    mockGeolocation.getCurrentPosition.mockImplementationOnce((successCallback, errorCallback) => {
      if (errorCallback) { // Ensure errorCallback is defined before calling
        errorCallback({ code: 1, message: 'User denied Geolocation' } as GeolocationPositionError);
      }
    });

    render(<LocationStep {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Use My Current Location/i }));

    await waitFor(() => {
      expect(screen.getByText(/Error detecting location: User denied Geolocation/i)).toBeInTheDocument();
    });
  });

  it('initializes with and displays data from props', () => {
    const existingData: Partial<PlannerData> = {
      location: {
        lat: 12.34,
        lon: 56.78,
        address: 'Existing Address',
        climateZone: 'Tropical (Test)',
        simplifiedClimate: 'Tropical',
      },
    };
    render(<LocationStep data={existingData} onDataChange={mockOnDataChange} />);

    expect(screen.getByPlaceholderText(/e.g., 123 Main St, Anytown/i)).toHaveValue('Existing Address');
    expect(screen.getByText(/Selected Location: Existing Address/i)).toBeInTheDocument();
    expect(screen.getByText(/Coordinates: Lat: 12.3400, Lon: 56.7800/i)).toBeInTheDocument();
    expect(screen.getByText(/Climate Zone: Tropical \(Test\)/i)).toBeInTheDocument();
  });

  // The "Next" button is handled by the parent component, so tests for its disabled/enabled state
  // based on local conditions within LocationStep are removed. LocationStep's responsibility is to call onDataChange.
  // Removing the test below as it was for a "Next" button that's not in this component.
  /*
  it('disables Next button if no address is available', () => {
    render(<LocationStep {...defaultProps} data={{ location: { address: '', lat: null, lon: null, climateZone: '' } }} />);
    const input = screen.getByPlaceholderText(/e.g., 123 Main St, Anytown/i);
    fireEvent.change(input, { target: { value: '' } });
    // Check some condition that would make parent disable next
  });

  it('enables Next button if an address is present', async () => {
    render(<LocationStep {...defaultProps} />);
    const input = screen.getByPlaceholderText(/e.g., 123 Main St, Anytown/i);
    fireEvent.change(input, { target: { value: 'New Address' } });
    fireEvent.click(screen.getByRole('button', { name: /Search/i }));
    await waitFor(() => {
      // Check some condition that would make parent enable next
    });
  });
  */
});
