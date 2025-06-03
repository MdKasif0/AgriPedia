'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react'; // Or any other relevant icon

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function AITips() {
  // Placeholder for AI tip logic. In a real app, this would fetch personalized tips.
  const aiTip = "Your basil may need more sunlight. Try moving it to a sunnier spot.";

  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Sparkles size={24} className="shrink-0 text-primary mt-1 group-hover:animate-ping once" />
            <div className="flex-grow">
              <CardTitle className="font-serif text-lg">AI-Powered Tips</CardTitle>
              <CardDescription className="text-sm">Personalized advice to help your garden thrive.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center">
          <p className="text-base font-medium text-foreground/90">{aiTip}</p>
          {/* Placeholder for more complex tip structures or actions */}
          {/* <Button variant="link" size="sm" className="mt-2 p-0 h-auto">Learn more</Button> */}
        </CardContent>
      </Card>
    </motion.div>
  );
}
