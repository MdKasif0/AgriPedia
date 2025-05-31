import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion'; // Import motion

export default function LearnSection() {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="font-serif">Learn Section</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4"> {/* Added margin-bottom for spacing */}
          A rich resource library with a glossary, beginner tips, composting guides, and seasonal planting strategies. Tutorials on DIY projects.
        </p>
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "hsl(var(--primary-hover))" }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow-md" // Basic button styling
        >
          Explore Resources
        </motion.button>
      </CardContent>
    </Card>
  );
}
