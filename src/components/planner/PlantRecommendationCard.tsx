import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plant } from '@/types/plant';
import { Sun, Droplets, Calendar, BookOpen, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlantRecommendationCardProps {
  plant: Plant;
  onAddToGrowPlan: (plant: Plant) => void;
  onAddToCalendar: (plant: Plant) => void;
  onLearnMore: (plant: Plant) => void;
  index: number;
}

export default function PlantRecommendationCard({
  plant,
  onAddToGrowPlan,
  onAddToCalendar,
  onLearnMore,
  index,
}: PlantRecommendationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="w-full hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="relative">
          {plant.image && (
            <div className="relative w-full h-48 mb-4">
              <img
                src={plant.image}
                alt={plant.commonName}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
          <CardTitle className="text-xl font-serif">{plant.commonName}</CardTitle>
          <p className="text-sm text-muted-foreground italic">{plant.scientificName}</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4 line-clamp-2">{plant.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">
                  {plant.climaticRequirements?.temperature.split('.')[0]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <span className="text-sm">
                  {plant.irrigationAndWaterNeeds?.split('.')[0]}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-500" />
                <span className="text-sm">
                  {plant.plantingAndHarvestCycles?.split('.')[0]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-500" />
                <span className="text-sm">
                  {plant.growthDuration?.split('.')[0]}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {plant.uses?.map((use, i) => (
              <span
                key={i}
                className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
              >
                {use.split('_').join(' ')}
              </span>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddToGrowPlan(plant)}
            className="flex-1"
          >
            <Sprout className="w-4 h-4 mr-2" />
            Add to Plan
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onAddToCalendar(plant)}
            className="flex-1"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Calendar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLearnMore(plant)}
            className="flex-1"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Learn More
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 