'use client';

import PersonalizedGrowPlanner from '@/components/homefeatures/PersonalizedGrowPlanner';
import StepByStepGuides from '@/components/homefeatures/StepByStepGuides';
import SmartCalendarReminders from '@/components/homefeatures/SmartCalendarReminders';
import PlantGrowthTracker from '@/components/homefeatures/PlantGrowthTracker';
import PlantHealthScanner from '@/components/homefeatures/PlantHealthScanner';
import SeedToHarvestTimeline from '@/components/homefeatures/SeedToHarvestTimeline';
import CommunityFeatures from '@/components/homefeatures/CommunityFeatures';
import LearnSection from '@/components/homefeatures/LearnSection';
// MyPlantsOverview is not part of this subtask's explicit list, so it will remain commented or removed if not needed.
// import MyPlantsOverview from '@/components/homefeatures/MyPlantsOverview';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-green-700">
          Welcome to AgriPedia!
        </h1>
        <p className="text-lg text-gray-600 mt-2">
          Your digital companion for successful gardening.
        </p>
      </header>

      <main>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Components will be placed here. Each component is already a card with rounded-2xl and shadow-lg. */}
          <PersonalizedGrowPlanner />
          <StepByStepGuides />
          <SmartCalendarReminders />
          <PlantGrowthTracker />
          <SeedToHarvestTimeline />
          <CommunityFeatures />
          <LearnSection />
          <PlantHealthScanner /> {/* Displayed as a card, it will fit into the grid */}
          {/* MyPlantsOverview could be added here if it becomes part of the scope */}
          {/* <MyPlantsOverview /> */}
        </div>
      </main>

      <footer className="mt-12 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} AgriPedia. Cultivating knowledge.</p>
      </footer>
    </div>
  );
}
