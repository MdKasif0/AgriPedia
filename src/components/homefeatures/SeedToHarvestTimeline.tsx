'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, RadioButtonUnchecked, Flower, Zap, ShoppingBasket, TreePine } from 'lucide-react'; // Example icons

interface Milestone {
  name: 'Planted' | 'Sprouting' | 'Seedling' | 'Vegetative' | 'Flowering' | 'Fruiting' | 'Harvest Ready' | 'Mid-Season' | 'End of Season';
  date: string; // For simplicity, using string date. Could be Date object.
  achieved: boolean;
  estimatedDaysFromPlanting?: number; // For display on the bar
}

interface PlantTimelineData {
  id: string;
  name: string;
  plantedDate: string; // YYYY-MM-DD
  estimatedHarvestDate: string; // YYYY-MM-DD
  totalDays: number; // Total days from planting to estimated harvest
  currentProgressDays: number; // Current progress in days from planting
  milestones: Milestone[];
}

// Mock Data
const sampleTimelines: PlantTimelineData[] = [
  {
    id: 'tomato-plant-1',
    name: 'Cherry Tomato "Sweetie"',
    plantedDate: '2024-03-01',
    estimatedHarvestDate: '2024-05-30', // Approx 90 days
    totalDays: 90,
    currentProgressDays: 60, // Example: 60 days in
    milestones: [
      { name: 'Planted', date: '2024-03-01', achieved: true, estimatedDaysFromPlanting: 0 },
      { name: 'Sprouting', date: '2024-03-10', achieved: true, estimatedDaysFromPlanting: 7 },
      { name: 'Vegetative', date: '2024-03-25', achieved: true, estimatedDaysFromPlanting: 20 },
      { name: 'Flowering', date: '2024-04-15', achieved: true, estimatedDaysFromPlanting: 45 },
      { name: 'Fruiting', date: '2024-05-05', achieved: false, estimatedDaysFromPlanting: 65 },
      { name: 'Harvest Ready', date: '2024-05-30', achieved: false, estimatedDaysFromPlanting: 90 },
    ],
  },
  {
    id: 'lettuce-plant-1',
    name: 'Romaine Lettuce "Caesar"',
    plantedDate: '2024-04-10',
    estimatedHarvestDate: '2024-06-05', // Approx 55 days
    totalDays: 55,
    currentProgressDays: 25, // Example: 25 days in
    milestones: [
      { name: 'Planted', date: '2024-04-10', achieved: true, estimatedDaysFromPlanting: 0 },
      { name: 'Sprouting', date: '2024-04-17', achieved: true, estimatedDaysFromPlanting: 7 },
      { name: 'Seedling', date: '2024-04-25', achieved: true, estimatedDaysFromPlanting: 15 },
      { name: 'Mid-Season', date: '2024-05-10', achieved: false, estimatedDaysFromPlanting: 30 },
      { name: 'Harvest Ready', date: '2024-06-05', achieved: false, estimatedDaysFromPlanting: 55 },
    ],
  },
   {
    id: 'zucchini-plant-1',
    name: 'Black Beauty Zucchini',
    plantedDate: '2024-05-01',
    estimatedHarvestDate: '2024-07-10', // Approx 70 days
    totalDays: 70,
    currentProgressDays: 10, // Example: 10 days in
    milestones: [
      { name: 'Planted', date: '2024-05-01', achieved: true, estimatedDaysFromPlanting: 0 },
      { name: 'Sprouting', date: '2024-05-08', achieved: false, estimatedDaysFromPlanting: 7 },
      { name: 'Vegetative', date: '2024-05-25', achieved: false, estimatedDaysFromPlanting: 24 },
      { name: 'Flowering', date: '2024-06-15', achieved: false, estimatedDaysFromPlanting: 45 },
      { name: 'Harvest Ready', date: '2024-07-10', achieved: false, estimatedDaysFromPlanting: 70 },
    ],
  }
];

const milestoneIcons: Record<Milestone['name'], React.ElementType> = {
  'Planted': TreePine,
  'Sprouting': Zap,
  'Seedling': Zap, // Could use a different one
  'Vegetative': RadioButtonUnchecked, // Placeholder, could be a leaf icon
  'Flowering': Flower,
  'Fruiting': ShoppingBasket, // Placeholder, could be a fruit icon
  'Harvest Ready': CheckCircle,
  'Mid-Season': RadioButtonUnchecked, // Generic
  'End of Season': CheckCircle, // Generic
};


const SeedToHarvestTimeline: React.FC = () => {
  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary">Seed-to-Harvest Timelines</CardTitle>
        <CardDescription>Visualize the growth progress and key milestones for your plants.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pt-2">
        {sampleTimelines.length === 0 && (
          <p className="text-muted-foreground">No plant timelines available. Add plants to your garden to see their progress here.</p>
        )}
        {sampleTimelines.map((plant) => {
          const progressPercentage = Math.min((plant.currentProgressDays / plant.totalDays) * 100, 100);
          return (
            <div key={plant.id} className="space-y-3">
              <h3 className="text-lg font-medium text-card-foreground">{plant.name}</h3>
              <p className="text-xs text-muted-foreground">
                Planted: {plant.plantedDate} | Estimated Harvest: {plant.estimatedHarvestDate} ({plant.totalDays} days total)
              </p>

              {/* Timeline Bar */}
              <div className="relative w-full h-8 bg-muted rounded-full overflow-hidden border border-border/50">
                <div
                  className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                >
                   <span className="absolute right-1 top-1/2 -translate-y-1/2 text-xs font-medium text-white pr-1">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                {/* Milestones on the bar */}
                {plant.milestones.map((milestone) => {
                  if (milestone.estimatedDaysFromPlanting === undefined) return null;
                  const milestonePosition = (milestone.estimatedDaysFromPlanting / plant.totalDays) * 100;
                  const Icon = milestoneIcons[milestone.name] || RadioButtonUnchecked;
                  return (
                    <div
                      key={milestone.name}
                      className="absolute top-1/2 -translate-y-1/2 group"
                      style={{ left: `${milestonePosition}%`, zIndex: milestone.achieved ? 2 : 1 }}
                      title={`${milestone.name} ${milestone.achieved ? '(Achieved)' : `(Est. Day ${milestone.estimatedDaysFromPlanting})`}`}
                    >
                      <Icon size={18} className={`
                        ${milestone.achieved ? 'text-primary fill-primary/30' : 'text-muted-foreground/70 fill-muted/30'}
                        bg-background rounded-full p-0.5 border border-border
                        hover:scale-125 transition-transform cursor-pointer
                      `} />
                       <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 text-xs bg-foreground text-background rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {milestone.name} {milestone.achieved ? `(${milestone.date})` : `(Est. Day ${milestone.estimatedDaysFromPlanting})`}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Key Milestones List (Optional detailed view) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-xs mt-1">
                {plant.milestones.map((milestone) => {
                   const Icon = milestoneIcons[milestone.name] || RadioButtonUnchecked;
                  return (
                  <div key={milestone.name} className={`flex items-center p-1.5 rounded-md ${milestone.achieved ? 'bg-green-500/10 text-green-700' : 'bg-muted/50 text-muted-foreground'}`}>
                     <Icon size={14} className="mr-1.5 flex-shrink-0" />
                    <span>
                      {milestone.name}
                      {milestone.achieved && <span className="text-xs block">({milestone.date})</span>}
                      {!milestone.achieved && milestone.estimatedDaysFromPlanting !== undefined && <span className="text-xs block">(Est. Day {milestone.estimatedDaysFromPlanting})</span>}
                    </span>
                  </div>
                )})}
              </div>
            </div>
          );
        })}
         <p className="text-xs text-muted-foreground mt-6 text-center">
            Note: Timelines are illustrative. Actual growth may vary.
        </p>
      </CardContent>
    </Card>
  );
};

export default SeedToHarvestTimeline;
