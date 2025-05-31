import React from 'react';

// Placeholder icons (optional, could use Heroicons or other libraries)
const ShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.126-1.263-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.126-1.263.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const CommunityFeatures: React.FC = () => {
  return (
    <div className="bg-card text-card-foreground shadow-lg rounded-2xl p-6 text-center">
      <h3 className="text-xl font-serif font-semibold mb-3 text-primary">Community Hub</h3>

      <p className="text-muted-foreground mb-6 px-4">
        Connect with fellow growers, share tips, and showcase your garden! This is the place to learn from others and inspire.
      </p>

      <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-col sm:items-center md:flex-row md:justify-center md:space-x-4 md:space-y-0">
        <button
          // onClick={() => alert('Share Your Garden functionality to be implemented')}
          className="w-full md:w-auto flex items-center justify-center bg-primary text-primary-foreground py-2.5 px-5 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 transition-all duration-150 ease-in-out hover:scale-[1.03]"
        >
          <ShareIcon />
          Share Your Garden
        </button>

        <button
          // onClick={() => alert('View Community Gardens functionality to be implemented')}
          className="w-full md:w-auto flex items-center justify-center bg-secondary text-secondary-foreground py-2.5 px-5 rounded-lg hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-opacity-50 transition-all duration-150 ease-in-out hover:scale-[1.03]"
        >
          <UsersIcon />
          View Community Gardens
        </button>
      </div>
      <p className="text-xs text-muted-foreground/80 mt-3">
        (Buttons are for UI demonstration)
      </p>
    </div>
  );
};

export default CommunityFeatures;
