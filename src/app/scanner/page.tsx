import React from 'react';
import { Metadata } from 'next';
import { ScannerView } from '@/components/scanner/ScannerView';

export const metadata: Metadata = {
  title: 'Plant Scanner - AgriPedia',
  description: 'Scan your plants for health issues and get care recommendations',
};

export default function ScannerPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold mb-8">Plant Health Scanner</h1>
      <ScannerView />
    </div>
  );
} 