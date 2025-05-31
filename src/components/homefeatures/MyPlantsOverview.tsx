'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button'; // For potential "Add Plant" button
import { Leaf, Sprout, Sun, Droplets, PlusCircle, Trash2 } from 'lucide-react'; // Example icons
// import { getUserPlants, removeUserPlant } from '@/lib/userDataStore'; // To be used later

// Interface for UserPlant (will also be in userDataStore.ts)
export interface UserPlant {
  id: string; // Should ideally match an ID from the main produce data, e.g., a slug like "tomato"
  name: string;
  imagePlaceholder?: string; // URL or path to a generic icon or uploaded image if available
  careSummary: string; // e.g., "Watering: Moderate, Sunlight: Full Sun"
  slug: string; // For linking to the detailed page, e.g., "/item/tomato"
}

// Mock Data - This would eventually come from userDataStore
const sampleUserPlants: UserPlant[] = [
  {
    id: 'tomato-cherry',
    name: 'Cherry Tomato "Sweetie"',
    imagePlaceholder: 'tomato', // Could map to a specific icon or a generic one
    careSummary: 'Watering: Regular, Sunlight: Full Sun (6-8h)',
    slug: 'tomato', // Assuming 'tomato' is a valid slug in the main plant library
  },
  {
    id: 'basil-genovese',
    name: 'Genovese Basil',
    imagePlaceholder: 'herb',
    careSummary: 'Watering: Keep moist, Sunlight: Partial to Full Sun (4-6h)',
    slug: 'basil',
  },
  {
    id: 'lettuce-romaine',
    name: 'Romaine Lettuce',
    imagePlaceholder: 'lettuce',
    careSummary: 'Watering: Consistent, Sunlight: Partial Sun (4h) or Full Sun in cooler weather',
    slug: 'lettuce',
  },
  {
    id: 'zucchini-black-beauty',
    name: 'Zucchini "Black Beauty"',
    imagePlaceholder: 'vegetable', // Generic vegetable icon
    careSummary: 'Watering: Deep, Sunlight: Full Sun (6-8h)',
    slug: 'zucchini',
  }
];

// Helper to get an icon based on imagePlaceholder
const PlantIcon: React.FC<{ type?: string }> = ({ type }) => {
  switch (type) {
    case 'tomato': return <Leaf className="w-8 h-8 text-red-500" />;
    case 'herb': return <Sprout className="w-8 h-8 text-green-600" />;
    case 'lettuce': return <Leaf className="w-8 h-8 text-green-400" />;
    default: return <Leaf className="w-8 h-8 text-muted-foreground" />;
  }
};

const MyPlantsOverview: React.FC = () => {
  const [userPlants, setUserPlants] = useState<UserPlant[]>(sampleUserPlants); // Will use getUserPlants()

  // useEffect(() => {
  //   setUserPlants(getUserPlants());
  // }, []);

  // const handleRemovePlant = (plantId: string) => {
  //   removeUserPlant(plantId);
  //   setUserPlants(getUserPlants()); // Re-fetch or filter locally
  // };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-semibold text-primary">My Garden Overview</CardTitle>
          <CardDescription>A quick glance at the plants you&apos;re currently tracking.</CardDescription>
        </div>
        {/* Future: Button to add a new plant directly or link to browse page */}
        {/* <Button variant="outline" size="sm" onClick={() => alert("Link to add plants page")}>
          <PlusCircle size={16} className="mr-2" /> Add Plant
        </Button> */}
      </CardHeader>
      <CardContent>
        {userPlants.length === 0 ? (
          <div className="text-center py-8">
            <Leaf size={48} className="mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">Your garden is looking a bit empty!</p>
            <p className="text-sm text-muted-foreground mb-4">
              Start adding plants from our library to track their progress here.
            </p>
            <Link href="/search" passHref>
              <Button>Browse & Add Plants</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userPlants.map(plant => (
              <Link key={plant.id} href={`/item/${plant.slug}`} passHref legacyBehavior>
                <a className="block group">
                  <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-200 ease-in-out cursor-pointer border-border/50 hover:border-primary/50">
                    <CardHeader className="flex flex-row items-start justify-between space-x-2 pb-2">
                      <div className="flex-grow">
                        <CardTitle className="text-lg font-medium group-hover:text-primary transition-colors">{plant.name}</CardTitle>
                      </div>
                       <div className="p-2 bg-muted/30 rounded-full">
                         <PlantIcon type={plant.imagePlaceholder} />
                       </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md">
                        {plant.careSummary}
                      </p>
                    </CardContent>
                    {/* <CardFooter className="pt-2 pb-3 text-xs">
                       Button to remove plant from overview
                       <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                        onClick={(e) => { e.preventDefault(); handleRemovePlant(plant.id); }}
                      >
                        <Trash2 size={14} className="mr-1.5" /> Remove from My Garden
                      </Button>
                    </CardFooter> */}
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
       {userPlants.length > 0 && (
         <CardFooter className="pt-4 border-t">
            <Link href="/search" passHref className="w-full">
                <Button variant="outline" className="w-full">
                    <PlusCircle size={16} className="mr-2" /> Add More Plants to Your Garden
                </Button>
            </Link>
         </CardFooter>
        )}
    </Card>
  );
};

export default MyPlantsOverview;
