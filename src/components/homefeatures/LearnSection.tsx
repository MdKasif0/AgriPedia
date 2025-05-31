import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { BookOpen } from 'lucide-react'; // Added icon for visual appeal

export default function LearnSection() {
  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="font-serif flex items-center">
          <BookOpen className="mr-2 h-6 w-6 text-primary group-hover:animate-sprout" />
          Learn Section
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">
          A rich resource library with a glossary, beginner tips, composting guides, and seasonal planting strategies. Tutorials on DIY projects.
        </p>
      </CardContent>
      <CardFooter>
        <Link href="/learn" passHref className="w-full">
          <Button className="w-full">
            <BookOpen className="mr-2 h-4 w-4" /> Browse Resources
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
