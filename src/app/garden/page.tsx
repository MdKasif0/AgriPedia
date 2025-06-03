import React from 'react';
import { Metadata } from 'next';
import { GardenView } from '@/components/garden/GardenView';

export const metadata: Metadata = {
  title: 'My Garden - AgriPedia',
  description: 'Manage and track your plants',
};

export default function GardenPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold mb-8">My Garden</h1>
      <GardenView />
    </div>
  );
} 