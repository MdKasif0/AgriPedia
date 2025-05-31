'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// import PersonalizedGrowPlanner from '@/components/homefeatures/PersonalizedGrowPlanner';
// import StepByStepGuides from '@/components/homefeatures/StepByStepGuides';
// import SmartCalendarReminders from '@/components/homefeatures/SmartCalendarReminders';
// import PlantGrowthTracker from '@/components/homefeatures/PlantGrowthTracker';
// import PlantHealthScanner from '@/components/homefeatures/PlantHealthScanner';
// import SeedToHarvestTimeline from '@/components/homefeatures/SeedToHarvestTimeline';
// import CommunityFeatures from '@/components/homefeatures/CommunityFeatures';
// import LearnSection from '@/components/homefeatures/LearnSection';
// import MyPlantsOverview from '@/components/homefeatures/MyPlantsOverview';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Optional: Redirect to the new search page if the home page should not be accessed directly.
    // Or, if it should be blank but accessible, remove this redirect.
    // For now, let's assume it should be blank and accessible.
    // If a redirect is desired, uncomment the following line:
    // router.replace('/search');
  }, [router]);

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Welcome to AgriPedia!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {/* Row 1: MyPlantsOverview can span more columns on larger screens if desired, or be a full-width section above the grid */}
        {/* <div className="lg:col-span-3"> */} {/* Example: Making MyPlantsOverview full width on large screens */}
          {/* <MyPlantsOverview /> */}
        {/* </div> */}

        {/* Subsequent features */}
        {/* <PersonalizedGrowPlanner /> */}
        {/* <SmartCalendarReminders /> */}
        {/* <PlantGrowthTracker /> */}
        {/* <SeedToHarvestTimeline /> */}
        {/* <PlantHealthScanner /> */}
        {/* <LearnSection /> */}
        {/* <StepByStepGuides /> */}
        {/* <CommunityFeatures /> */}
      </div>
    </div>
  );
}
