'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, Wand2 } from 'lucide-react'; // Or another suitable icon like Construction
import { motion } from 'framer-motion';

const FutureFeatureTeaserCard: React.FC = () => {
  return (
    <motion.div
      className="h-full"
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Card className="rounded-2xl h-full flex flex-col group bg-gradient-to-br from-primary/10 via-transparent to-transparent hover:shadow-xl transition-shadow duration-300 ease-in-out">
        <CardHeader className="pb-3">
          <CardTitle className="font-serif text-lg flex items-center">
            <Wand2 size={22} className="mr-2 text-primary group-hover:animate-spin-slow" />
            Coming Soon!
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col items-center justify-center text-center">
          <Sparkles size={36} className="text-primary/80 mb-3 group-hover:scale-110 transition-transform duration-300" />
          <h3 className="text-xl font-semibold text-foreground/90 mb-1">AI Garden Design Assistant</h3>
          <p className="text-sm text-muted-foreground px-2">
            Get ready to visualize and plan your dream garden with intelligent assistance.
          </p>
        </CardContent>
        {/* No CardFooter needed for this teaser, or add a subtle one if desired */}
      </Card>
    </motion.div>
  );
};

export default FutureFeatureTeaserCard;
