import React from 'react';
import { Metadata } from 'next';
import { LearnView } from '@/components/learn/LearnView';

export const metadata: Metadata = {
  title: 'Learn - AgriPedia',
  description: 'Expand your gardening knowledge',
};

export default function LearnPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-serif font-bold mb-8">Learn</h1>
      <LearnView />
    </div>
  );
} 