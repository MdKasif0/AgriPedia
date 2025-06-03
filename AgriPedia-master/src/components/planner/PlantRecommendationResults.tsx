import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlantRecommendation } from '@/types/plant';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface PlantRecommendationResultsProps {
  recommendations: PlantRecommendation[];
  isLoading?: boolean;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function PlantRecommendationResults({ recommendations, isLoading }: PlantRecommendationResultsProps) {
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

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Recommended Plants</h3>
      <div className="grid gap-4">
        {recommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.plant.id}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <div className="flex">
                <div className="w-24 h-24 bg-muted">
                  <img
                    src={recommendation.plant.imageUrl}
                    alt={recommendation.plant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-4">
                  <CardHeader className="p-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{recommendation.plant.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{recommendation.plant.scientificName}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">{recommendation.matchScore}%</span>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 mt-2">
                    <p className="text-sm text-muted-foreground mb-2">{recommendation.plant.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {recommendation.matchReasons.map((reason, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                        >
                          {reason}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
} 