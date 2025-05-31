import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Users, Share2 } from 'lucide-react'; // Added icons for visual appeal

export default function CommunityFeatures() {
  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="font-serif flex items-center">
          <Users className="mr-2 h-6 w-6 text-primary group-hover:animate-sprout" />
          Community Features
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          Connect with other gardeners. Share your gardens, tips, and progress. Ask questions and get advice from the community.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between gap-3">
        <Link href="/community" passHref className="flex-1">
          <Button className="w-full">
            <Users className="mr-2 h-4 w-4" /> Explore Community
          </Button>
        </Link>
        <Link href="/community/share" passHref className="flex-1">
          <Button variant="outline" className="w-full">
            <Share2 className="mr-2 h-4 w-4" /> Share Your Garden
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
