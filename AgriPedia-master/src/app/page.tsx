'use client';

import { motion } from 'framer-motion';
import MyPlantsOverview from '@/components/homefeatures/MyPlantsOverview';
import PersonalizedGrowPlanner from '@/components/homefeatures/PersonalizedGrowPlanner';
import PlantGrowthTracker from '@/components/homefeatures/PlantGrowthTracker';
import PlantHealthScanner from '@/components/homefeatures/PlantHealthScanner';
import SmartCalendarReminders from '@/components/homefeatures/SmartCalendarReminders';
import QuickActions from '@/components/home/QuickActions'; // Import QuickActions
import InfoBanner from '@/components/home/InfoBanner'; // Import InfoBanner
import { Lightbulb } from 'lucide-react'; // Import an icon for the banner
import StepByStepGuides from '@/components/homefeatures/StepByStepGuides';
import SeedToHarvestTimeline from '@/components/homefeatures/SeedToHarvestTimeline';
import CommunityFeatures from '@/components/homefeatures/CommunityFeatures';
import LearnSection from '@/components/homefeatures/LearnSection';

// Import the new AI feature components
import SmartPlantRecommender from '@/components/homefeatures/SmartPlantRecommender';
import DiseasePrediction from '@/components/homefeatures/DiseasePrediction';
import AITips from '@/components/homefeatures/AITips';
import AIGardenDesignAssistantTeaser from '@/components/homefeatures/AIGardenDesignAssistantTeaser';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3, // Optional delay before children start animating
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function HomePage() {
  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <motion.header
        className="w-full max-w-4xl mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <h1 className="text-4xl font-bold text-center text-primary font-serif">Welcome to EcoGrow!</h1>
        <p className="text-lg text-center text-foreground/80 mt-2">Your personal guide to successful gardening.</p>
      </motion.header>

      <main className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <InfoBanner
            icon={Lightbulb}
            title="Tip of the Day"
            description="Remember to check the soil moisture before watering your plants. Overwatering can be as harmful as underwatering!"
            className="mb-6" // Rely on new theme for banner styling
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <QuickActions /> {/* Add QuickActions component here */}
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}><MyPlantsOverview /></motion.div>
          <motion.div variants={itemVariants}><PersonalizedGrowPlanner /></motion.div>
          <motion.div variants={itemVariants}><PlantGrowthTracker /></motion.div>
          <motion.div variants={itemVariants}><PlantHealthScanner /></motion.div>
          <motion.div variants={itemVariants}><SmartCalendarReminders /></motion.div>
          <motion.div variants={itemVariants}><StepByStepGuides /></motion.div>
          <motion.div variants={itemVariants}><SeedToHarvestTimeline /></motion.div>
          <motion.div variants={itemVariants}><CommunityFeatures /></motion.div>
          <motion.div variants={itemVariants}><LearnSection /></motion.div>
          {/* New AI Feature Components */}
          <motion.div variants={itemVariants}><SmartPlantRecommender /></motion.div>
          <motion.div variants={itemVariants}><DiseasePrediction /></motion.div>
          <motion.div variants={itemVariants}><AITips /></motion.div>
          <motion.div variants={itemVariants}><AIGardenDesignAssistantTeaser /></motion.div>
          {/* Add more components here as they are developed */}
        </motion.div>
      </main>

      <footer className="w-full max-w-4xl mt-12 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} EcoGrow. Grow smarter.</p>
      </footer>
    </div>
  );
}
