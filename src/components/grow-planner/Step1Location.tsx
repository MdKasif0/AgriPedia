import React from 'react';

interface Step1LocationProps {
  formData: {
    latitude?: string;
    longitude?: string;
    climateZone?: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const Step1Location: React.FC<Step1LocationProps> = ({ formData, setFormData }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevData: any) => ({
      ...prevData,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-gray-700">Step 1: Location</h2>
      <div className="space-y-4">
        <div>
          <label htmlFor="latitude" className="block text-sm font-medium text-gray-600 mb-1">
            Latitude
          </label>
          <input
            type="text"
            name="latitude"
            id="latitude"
            value={formData.latitude || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., 34.0522"
          />
        </div>
        <div>
          <label htmlFor="longitude" className="block text-sm font-medium text-gray-600 mb-1">
            Longitude
          </label>
          <input
            type="text"
            name="longitude"
            id="longitude"
            value={formData.longitude || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., -118.2437"
          />
        </div>
        <div>
          <label htmlFor="climateZone" className="block text-sm font-medium text-gray-600 mb-1">
            Climate Zone (Optional)
          </label>
          <input
            type="text"
            name="climateZone"
            id="climateZone"
            value={formData.climateZone || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., USDA Zone 10a"
          />
        </div>
      </div>
    </div>
  );
};

export default Step1Location;
