import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // Import Button
import Link from 'next/link'; // Import Link
import { NotebookPen } from 'lucide-react'; // Example icon

export default function StepByStepGuides() {
  return (
    <Card className="rounded-2xl h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="font-serif">Step-by-Step Growing Guides</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col justify-between"> {/* Allow content to grow and space button */}
        <p className="text-sm text-muted-foreground mb-4"> {/* Added mb-4 for spacing */}
          Detailed instructions for planting, watering, spacing, fertilizing, and harvesting. Covers indoor, outdoor, hydroponic, and vertical methods.
        </p>
        <Link href="/planner" passHref legacyBehavior>
          <Button
            variant="outline"
            className="w-full group/button mt-auto border-primary/50 hover:bg-primary/5 hover:border-primary dark:border-primary/40 dark:hover:bg-primary/10 dark:hover:border-primary/70 transition-colors duration-150"
          >
            <NotebookPen className="h-4 w-4 mr-2 text-primary/80 group-hover/button:text-primary transition-colors duration-150" />
            <span>
              Personalize Your Guides
              <span className="text-xs text-muted-foreground group-hover/button:text-primary/90 transition-colors duration-150"> (Set Up Grow Planner)</span>
            </span>
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
