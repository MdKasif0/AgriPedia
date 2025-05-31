'use client'; // Good practice for consistency

import React from 'react';
import { Users, Construction } from 'lucide-react'; // Example icons

export default function CommunityFeatures() {
  return (
    <div className="p-4 border rounded-lg shadow-md bg-white h-full flex flex-col items-center justify-center text-center">
      {/* <Construction size={48} className="text-yellow-500 mb-4" /> */}
      <Users size={48} className="text-green-600 mb-4" />
      <h3 className="text-xl font-semibold mb-2 text-gray-800">Community Hub</h3>
      <p className="text-gray-600 text-sm">
        Coming Soon! Connect with fellow gardeners, share your progress, ask questions, and exchange tips.
        We're working on building a vibrant community space for AgriPedia users.
      </p>
      <p className="text-xs text-gray-400 mt-3">
        (Stay tuned for updates!)
      </p>
    </div>
  );
}
