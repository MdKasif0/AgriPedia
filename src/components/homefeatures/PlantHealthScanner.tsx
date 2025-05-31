import React from 'react';
// Assuming you might have an icon library or want to use SVGs later
// For now, a simple emoji or text prefix can denote "camera"
// import { CameraIcon } from '@heroicons/react/outline';

const PlantHealthScanner: React.FC = () => {
  return (
    <div className="bg-card text-card-foreground shadow-lg rounded-2xl p-6 flex flex-col items-center text-center">
      <h3 className="text-xl font-serif font-semibold mb-3 text-primary">Plant Health Scanner</h3>

      {/* Optional: Placeholder for an icon, e.g., a camera icon */}
      <div className="my-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>

      <p className="text-muted-foreground mb-4">
        Quickly scan your plants for diseases or nutrient deficiencies.
        This feature is primarily accessed through our dedicated Camera Tab.
      </p>

      <button
        // onClick={() => { /* Navigation logic will be added later */ alert('Navigating to Camera Tab...'); }}
        className="bg-primary text-primary-foreground py-2 px-6 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 transition-all duration-150 ease-in-out hover:scale-[1.03]"
      >
        Go to Camera Tab
      </button>
      <p className="text-xs text-muted-foreground/80 mt-2">
        (Button is for UI demonstration)
      </p>
    </div>
  );
};

export default PlantHealthScanner;
