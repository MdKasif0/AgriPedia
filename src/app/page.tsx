'use client';

'use client';

// import { useEffect } from 'react'; // Removed as useEffect is no longer used
// import { useRouter } from 'next/navigation'; // Removed as useRouter is no longer used
import PersonalizedGrowPlanner from '@/components/homefeatures/PersonalizedGrowPlanner';
import StepByStepGuides from '@/components/homefeatures/StepByStepGuides';
import SmartCalendarReminders from '@/components/homefeatures/SmartCalendarReminders';
import PlantGrowthTracker from '@/components/homefeatures/PlantGrowthTracker';
// import PlantHealthScanner from '@/components/homefeatures/PlantHealthScanner';
import SeedToHarvestTimeline from '@/components/homefeatures/SeedToHarvestTimeline';
import CommunityFeatures from '@/components/homefeatures/CommunityFeatures';
import LearnSection from '@/components/homefeatures/LearnSection';
import MyPlantsOverview from '@/components/homefeatures/MyPlantsOverview';

export default function HomePage() {
  // const router = useRouter(); // Removed as useRouter is no longer used

  // useEffect(() => { // Removed as per requirement
    // Optional: Redirect to the new search page if the home page should not be accessed directly.
    // Or, if it should be blank but accessible, remove this redirect.
    // For now, let's assume it should be blank and accessible.
    // If a redirect is desired, uncomment the following line:
    // router.replace('/search');
  // }, [router]);

  return (
    <div className="flex flex-col p-6 min-h-screen">
      <MyPlantsOverview />
      <SmartCalendarReminders />
      <PersonalizedGrowPlanner />
      <StepByStepGuides />
      <PlantGrowthTracker />
      <SeedToHarvestTimeline />
      <CommunityFeatures />
      <LearnSection />
    </div>
  );
}
