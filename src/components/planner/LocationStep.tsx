import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';
import type { PlannerData } from '@/types/planner'; // Import PlannerData

interface StepProps {
  plannerData: Partial<PlannerData>;
  onDataChange: (updatedData: Partial<PlannerData>) => void;
}

const LocationStep: React.FC<StepProps> = ({ plannerData, onDataChange }) => {
  // Initialize internal state from plannerData.location or default
  const [manualAddress, setManualAddress] = useState(plannerData.location?.address || '');
  const [locationInfo, setLocationInfo] = useState<PlannerData['location']>(
    plannerData.location || { lat: null, lon: null, address: '', climateZone: '' }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effect to update local state if plannerData.location changes (e.g., user goes back and forth)
  useEffect(() => {
    if (plannerData.location) {
      setLocationInfo(plannerData.location);
      setManualAddress(plannerData.location.address || '');
    } else {
      // Reset if plannerData.location is cleared
      setLocationInfo({ lat: null, lon: null, address: '', climateZone: '' });
      setManualAddress('');
    }
  }, [plannerData.location]);

  const updateParentState = (newLocationData: PlannerData['location']) => {
    setLocationInfo(newLocationData);
    onDataChange({ location: newLocationData });
  };

  const handleDetectLocation = () => {
    setIsLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const detectedLocation: PlannerData['location'] = {
            lat: latitude,
            lon: longitude,
            address: `Coordinates: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
            climateZone: 'Temperate (Placeholder)', // Replace with actual climate zone logic
          };
          updateParentState(detectedLocation);
          setManualAddress(detectedLocation.address || '');
          setIsLoading(false);
        },
        (err) => {
          setError(`Error detecting location: ${err.message}`);
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
      setIsLoading(false);
    }
  };

  const handleManualSearch = () => {
    setIsLoading(true);
    setError(null);
    const searchedLocation: PlannerData['location'] = {
      lat: null,
      lon: null,
      address: manualAddress,
      climateZone: 'Varies (Placeholder)', // Replace with actual climate zone logic based on address
    };
    updateParentState(searchedLocation);
    setIsLoading(false);
  };

  // No handleSubmit needed here, data is sent via onDataChange.
  // Navigation (Next/Previous) is handled by the parent PlannerPage.

  return (
    <div className="space-y-6 py-4"> {/* Added py-4 for consistent spacing with other steps */}
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100"> {/* Changed to h3 for semantic consistency */}
        <MapPin className="inline mr-2 h-5 w-5" /> Where are you planning to grow?
      </h3>

      <div className="space-y-2">
        <label htmlFor="manualAddress" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Enter your address or city
        </label>
        <div className="flex space-x-2">
          <Input
            id="manualAddress"
            type="text"
            value={manualAddress}
            onChange={(e) => setManualAddress(e.target.value)}
            placeholder="e.g., 123 Main St, Anytown"
            className="flex-grow bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <Button onClick={handleManualSearch} variant="outline" disabled={isLoading}>
            <Search className="mr-2 h-4 w-4" /> Search
          </Button>
        </div>
      </div>

      <Button onClick={handleDetectLocation} className="w-full" disabled={isLoading}>
        {isLoading ? 'Detecting...' : 'Use My Current Location'}
      </Button>

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {locationInfo.address && ( // Check if locationInfo itself has an address to display summary
        <div className="p-3 bg-muted/50 dark:bg-muted/20 rounded-md text-sm border border-border">
          <p><strong>Selected Location:</strong> {locationInfo.address}</p>
          {locationInfo.lat && locationInfo.lon && (
            <p><strong>Coordinates:</strong> Lat: {locationInfo.lat.toFixed(4)}, Lon: {locationInfo.lon.toFixed(4)}</p>
          )}
          <p><strong>Climate Zone:</strong> {locationInfo.climateZone}</p>
        </div>
      )}
      {/* Navigation buttons are now handled by the parent PlannerPage component */}
    </div>
  );
};

export default LocationStep;
