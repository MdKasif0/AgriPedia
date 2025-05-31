'use client';

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
// Import other components that might be created in later steps, like QuickActions or InfoBanner, if they are ready.

export default function HomePage() {
  return (
    <div className="flex flex-col items-center min-h-screen p-4 bg-gray-50">
      <header className="w-full max-w-4xl mb-8">
        <h1 className="text-4xl font-bold text-center text-green-700">Welcome to AgriPedia!</h1>
        <p className="text-lg text-center text-gray-600 mt-2">Your personal guide to successful gardening.</p>
      </header>

      <main className="w-full max-w-4xl">
        <InfoBanner
          icon={Lightbulb}
          title="Tip of the Day"
          description="Remember to check the soil moisture before watering your plants. Overwatering can be as harmful as underwatering!"
          className="mb-6 bg-blue-500 text-white" // Example custom styling
        />

        <QuickActions /> {/* Add QuickActions component here */}

        {/* This section can be used for an InfoBanner or QuickActions later */}
        {/* <div className="mb-6"> */}
        {/*   Placeholder for InfoBanner or QuickActions */}
        {/* </div> */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MyPlantsOverview />
          <PersonalizedGrowPlanner />
          <PlantGrowthTracker />
          <PlantHealthScanner />
          <SmartCalendarReminders />
          <StepByStepGuides />
          <SeedToHarvestTimeline />
          <CommunityFeatures />
          <LearnSection />
          {/* Add more components here as they are developed */}
        </div>
      </main>

      <footer className="w-full max-w-4xl mt-12 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} AgriPedia. Grow smarter.</p>
      </footer>
    </div>
  );
}
