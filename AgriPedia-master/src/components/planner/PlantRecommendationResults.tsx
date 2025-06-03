import React, { useState } from 'react';
import { PlantRecommendation } from '@/types/plant';
import { motion } from 'framer-motion';
import { AlertCircle, Filter } from 'lucide-react';
import PlantCard from './PlantCard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PlantRecommendationResultsProps {
  recommendations: PlantRecommendation[];
  isLoading?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function PlantRecommendationResults({ recommendations, isLoading }: PlantRecommendationResultsProps) {
  const [filters, setFilters] = useState({
    fastGrowing: false,
    beginnerFriendly: false,
    indoor: false,
  });

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Finding the perfect plants for you...</p>
      </div>
    );
  }

  if (!recommendations.length) {
    return (
      <div className="text-center p-4">
        <AlertCircle className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-2 text-muted-foreground">No plants found matching your criteria. Try adjusting your preferences.</p>
      </div>
    );
  }

  const filteredRecommendations = recommendations.filter(rec => {
    if (filters.fastGrowing && rec.plant.harvestTime.min > 60) return false;
    if (filters.beginnerFriendly && rec.plant.difficultyLevel !== 'beginner') return false;
    if (filters.indoor && !rec.plant.spaceRequirements.containerFriendly) return false;
    return true;
  });

  const handleAddToCalendar = (plant: any) => {
    // Implement calendar integration
    console.log('Add to calendar:', plant);
  };

  const handleLearnMore = (plant: any) => {
    // Implement learn more functionality
    console.log('Learn more:', plant);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Recommended Plants</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuCheckboxItem
              checked={filters.fastGrowing}
              onCheckedChange={(checked) => 
                setFilters(prev => ({ ...prev, fastGrowing: checked }))
              }
            >
              Fast Growing
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.beginnerFriendly}
              onCheckedChange={(checked) => 
                setFilters(prev => ({ ...prev, beginnerFriendly: checked }))
              }
            >
              Beginner Friendly
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={filters.indoor}
              onCheckedChange={(checked) => 
                setFilters(prev => ({ ...prev, indoor: checked }))
              }
            >
              Indoor Plants
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredRecommendations.map((recommendation) => (
          <PlantCard
            key={recommendation.plant.id}
            plant={recommendation.plant}
            onAddToCalendar={handleAddToCalendar}
            onLearnMore={handleLearnMore}
          />
        ))}
      </motion.div>
    </div>
  );
} 