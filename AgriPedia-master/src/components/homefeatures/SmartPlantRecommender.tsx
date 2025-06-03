'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react'; // Or any other relevant icon

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function SmartPlantRecommender() {
  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Lightbulb size={24} className="shrink-0 text-primary mt-1 group-hover:animate-sprout origin-bottom transition-transform duration-300" />
            <div className="flex-grow">
              <CardTitle className="font-serif text-lg">Smart Plant Recommender</CardTitle>
              <CardDescription className="text-sm">Get plant suggestions tailored to your space and goals.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center items-center">
          {/* Placeholder for recommendation logic */}
          <p className="text-sm text-muted-foreground">Recommendations will appear here based on your profile.</p>
          {/* Example of how recommendations might look - replace with actual logic later */}
          {/* <ul className="list-disc pl-5 mt-2 text-sm">
            <li>Tomato 'Sungold' - Sunny spot, great for beginners</li>
            <li>Basil 'Genovese' - Partial shade, good companion plant</li>
          </ul> */}
        </CardContent>
      </Card>
    </motion.div>
  );
}
