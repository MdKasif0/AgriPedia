'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, MessageSquare, Share2, MapPin, Construction } from 'lucide-react'; // Example icons

interface CommunityFeaturePlaceholder {
  id: string;
  title: string;
  description: string;
  status: 'Coming Soon!' | 'Feature Under Development' | 'Future Idea' | 'Planned';
  icon: React.ElementType;
}

const placeholderFeatures: CommunityFeaturePlaceholder[] = [
  {
    id: 'share-garden',
    title: 'Share Your Garden',
    description: 'Showcase your garden photos, plant progress, and success stories with the AgriPedia community.',
    status: 'Coming Soon!',
    icon: Share2,
  },
  {
    id: 'community-tips',
    title: 'Community Tips & Tricks',
    description: 'Exchange valuable gardening advice, ask questions, and learn from the collective wisdom of fellow gardeners.',
    status: 'Feature Under Development',
    icon: MessageSquare,
  },
  {
    id: 'local-swaps',
    title: 'Local Plant Swaps & Events',
    description: 'Discover or organize local seed exchanges, plant swaps, and gardening meetups in your area.',
    status: 'Future Idea',
    icon: MapPin,
  },
  {
    id: 'expert-qna',
    title: 'Expert Q&A Sessions',
    description: 'Participate in Q&A sessions with gardening experts and get your toughest questions answered.',
    status: 'Planned',
    icon: Users,
  }
];

const CommunityFeatures: React.FC = () => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="text-center">
        <Users className="mx-auto h-12 w-12 text-primary mb-2" />
        <CardTitle className="text-2xl font-semibold text-primary">Connect with Fellow Gardeners</CardTitle>
        <CardDescription>
          Our community features are growing! Here&apos;s a sneak peek at what&apos;s planned.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        {placeholderFeatures.map((feature) => (
          <div key={feature.id} className="p-4 bg-muted/50 rounded-lg shadow-sm border border-border/30">
            <div className="flex items-start space-x-3">
              <feature.icon className="h-6 w-6 text-muted-foreground mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-card-foreground">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300">
                  <Construction size={12} className="mr-1.5" />
                  {feature.status}
                </div>
              </div>
            </div>
          </div>
        ))}
        <p className="text-sm text-muted-foreground mt-8 text-center">
          We&apos;re excited to bring these features to you. Stay tuned for updates!
        </p>
      </CardContent>
    </Card>
  );
};

export default CommunityFeatures;
