'use client';

import { PlantHealthDetector } from '@/components/health-detector/PlantHealthDetector';

export default function ScannerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Plant Health Scanner</h1>
        <PlantHealthDetector />
      </div>
    </div>
  );
} 