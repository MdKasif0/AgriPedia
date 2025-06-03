'use client';

import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScanLine } from 'lucide-react'; // Or any other relevant icon

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function DiseasePrediction() {
  const handleScan = () => {
    // Placeholder for scan logic
    console.log("Scan initiated");
    // In a real application, this would trigger image capture or file upload
    // and then call an AI model for disease prediction.
  };

  return (
    <motion.div variants={itemVariants}>
      <Card className="h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 ease-in-out bg-gradient-to-br from-primary/10 via-transparent to-transparent">
        <CardHeader>
          <div className="flex items-start gap-3">
            <ScanLine size={24} className="shrink-0 text-primary mt-1 group-hover:animate-pulse transition-transform duration-300" />
            <div className="flex-grow">
              <CardTitle className="font-serif text-lg">Disease Prediction</CardTitle>
              <CardDescription className="text-sm">Scan a leaf or soil to detect issues early.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col justify-center items-center">
          <Button onClick={handleScan} className="mt-2">
            <ScanLine size={18} className="mr-2" />
            Scan Now
          </Button>
          {/* Placeholder for displaying scan results */}
          {/* <p className="text-sm text-muted-foreground mt-3">Scan results will appear here.</p> */}
        </CardContent>
      </Card>
    </motion.div>
  );
}
