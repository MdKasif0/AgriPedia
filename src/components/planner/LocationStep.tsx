import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Search } from 'lucide-react';

interface LocationData {
  lat?: number | null;
  lon?: number | null;
  address?: string;
  climateZone?: string; // Placeholder
}

interface LocationStepProps {
  onNext: (data: { location: LocationData }) => void;
  onBack: () => void;
  data: { location?: LocationData };
}

const LocationStep: React.FC<LocationStepProps> = ({ onNext, onBack, data }) => {
  const [manualAddress, setManualAddress] = useState(data.location?.address || '');
  const [locationInfo, setLocationInfo] = useState<LocationData>(data.location || { lat: null, lon: null, address: '', climateZone: 'Fetching...' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with passed data
  useEffect(() => {
    if (data.location) {
      setLocationInfo(data.location);
      setManualAddress(data.location.address || '');
    }
  }, [data.location]);

  const handleDetectLocation = () => {
    setIsLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Placeholder for reverse geocoding and climate zone
          // For now, just set lat/lon and a dummy address/climate zone
          const detectedLocation = {
            lat: latitude,
            lon: longitude,
            address: `Coordinates: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`,
            climateZone: 'Temperate (Placeholder)',
          };
          setLocationInfo(detectedLocation);
          setManualAddress(detectedLocation.address);
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
    // For now, just use the manual address and clear lat/lon
    // A real implementation would call a geocoding API
    setIsLoading(true);
    setError(null);
    const searchedLocation = {
      lat: null, // Or fetch from geocoding API
      lon: null, // Or fetch from geocoding API
      address: manualAddress,
      climateZone: 'Varies (Placeholder)',
    };
    setLocationInfo(searchedLocation);
    setIsLoading(false);
  };

  const handleSubmit = () => {
    onNext({ location: locationInfo });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        <MapPin className="inline mr-2 h-5 w-5" /> Where are you planning to grow?
      </h2>

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

      {locationInfo.address && (
        <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-md text-sm">
          <p className="text-gray-900 dark:text-white"><strong>Selected Location:</strong> {locationInfo.address}</p>
          {locationInfo.lat && locationInfo.lon && (
            <p className="text-gray-900 dark:text-white"><strong>Coordinates:</strong> Lat: {locationInfo.lat.toFixed(4)}, Lon: {locationInfo.lon.toFixed(4)}</p>
          )}
          <p className="text-gray-900 dark:text-white"><strong>Climate Zone:</strong> {locationInfo.climateZone}</p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button onClick={onBack} variant="outline" disabled={isLoading}> {/* onBack might need to be disabled if currentStep is 0, handled in parent */}
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading || (!locationInfo.address && !manualAddress)}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default LocationStep;
