'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Wand2 } from 'lucide-react'; // Or any other relevant icon for "magic" or "assistant"

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function AIGardenDesignAssistantTeaser() {
  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
        <CardHeader>
          <div className="flex items-start gap-3">
            <Wand2 size={24} className="shrink-0 text-primary mt-1 group-hover:scale-110 transition-transform duration-300" />
            <div className="flex-grow">
              <CardTitle className="font-serif text-lg">AI Garden Design Assistant</CardTitle>
              <CardDescription className="text-sm">Visualize and plan your dream garden with AI.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center items-center">
          <div className="text-center">
            <p className="text-xl font-semibold text-primary">Coming Soon!</p>
            <p className="text-sm text-muted-foreground mt-1">Get ready to design your perfect garden layout.</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
