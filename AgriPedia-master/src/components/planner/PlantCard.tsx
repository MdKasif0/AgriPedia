import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plant } from '@/types/plant';
import { motion } from 'framer-motion';
import { Sun, Droplets, Calendar, BookOpen, Sprout } from 'lucide-react';
import { useGrowPlan } from '@/hooks/useGrowPlan';

interface PlantCardProps {
  plant: Plant;
  onAddToCalendar?: (plant: Plant) => void;
  onLearnMore?: (plant: Plant) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function PlantCard({ plant, onAddToCalendar, onLearnMore }: PlantCardProps) {
  const { addToGrowPlan, isInGrowPlan } = useGrowPlan();

  const getLightIcon = (light: string) => {
    switch (light) {
      case 'full':
        return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'partial':
        return <Sun className="w-4 h-4 text-yellow-400" />;
      case 'shade':
        return <Sun className="w-4 h-4 text-gray-400" />;
      default:
        return <Sun className="w-4 h-4" />;
    }
  };

  const formatGrowingSeason = (start: number, end: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[start - 1]} - ${months[end - 1]}`;
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="relative h-48">
          <img
            src={plant.imageUrl}
            alt={plant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {getLightIcon(plant.lightRequirements)}
            <Droplets className="w-4 h-4 text-blue-500" />
          </div>
        </div>

        <CardHeader className="p-4">
          <CardTitle className="text-xl font-serif">{plant.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{plant.scientificName}</p>
        </CardHeader>

        <CardContent className="p-4 pt-0 flex-grow">
          <p className="text-sm mb-4">{plant.description}</p>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium">Growing Season</p>
              <p className="text-muted-foreground">
                {formatGrowingSeason(plant.growingSeason.start, plant.growingSeason.end)}
              </p>
            </div>
            <div>
              <p className="font-medium">Days to Harvest</p>
              <p className="text-muted-foreground">
                {plant.harvestTime.min}-{plant.harvestTime.max} days
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
          <Button
            variant={isInGrowPlan(plant.id) ? "secondary" : "default"}
            size="sm"
            className="flex-1"
            onClick={() => addToGrowPlan(plant)}
          >
            <Sprout className="w-4 h-4 mr-2" />
            {isInGrowPlan(plant.id) ? 'In Grow Plan' : 'Add to Grow Plan'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onAddToCalendar?.(plant)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Add to Calendar
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => onLearnMore?.(plant)}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Learn More
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
} 