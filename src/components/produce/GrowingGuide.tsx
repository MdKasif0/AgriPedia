'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation'; // For client-side navigation
import type { GrowingGuide, GrowingStage, PlantGuideProgress } from '@/lib/produceData';
import { getPlantGuideProgressByPlanterId, upsertPlantGuideProgress } from '@/lib/userDataStore';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import CollapsibleInfoSection from '@/components/ui/CollapsibleInfoSection';
import StageImageCarousel from './StageImageCarousel';
import { Button } from '@/components/ui/button'; // Import Button
import { MessageCircleQuestion } from 'lucide-react'; // Import AI icon
import { PREFILLED_CHAT_PROMPT_KEY } from '@/lib/constants'; // Import constant
import { Lightbulb, AlertTriangle, Info, CheckCircle, Circle, Wrench, ClipboardList, Image as ImageIcon, Video as VideoIcon, CalendarDays } from 'lucide-react';

interface GrowingGuideProps {
  guide: GrowingGuide | null;
  planterId?: string; // Unique ID for this instance of the plant in the user's plan
  className?: string;
}

const GrowingGuideDisplay: React.FC<GrowingGuideProps> = ({ guide, planterId, className }) => {
  const [completedStages, setCompletedStages] = useState<Record<string, boolean>>({});
  const [stageNotes, setStageNotes] = useState<Record<string, string>>({});
  const [plantProgressData, setPlantProgressData] = useState<PlantGuideProgress | null>(null);
  const router = useRouter(); // Initialize router

  const handleAskAi = (stageName: string, plantName: string, currentInstructions: string[]) => {
    // Ensure this key is consistent with ChatInput.tsx
    // const PREFILLED_CHAT_PROMPT_KEY = 'agripedia-prefilled-chat-prompt'; // Now imported
    const relevantInstructions = currentInstructions.slice(0, 2).join(' ');
    const prompt = `I have a question about my ${plantName} during the '${stageName}' stage.
Currently, the instructions I'm following are: "${relevantInstructions}".
My question is: `;

    localStorage.setItem(PREFILLED_CHAT_PROMPT_KEY, prompt);
    router.push('/chat');
  };

  useEffect(() => {
    if (planterId) {
      const progress = getPlantGuideProgressByPlanterId(planterId);
      setPlantProgressData(progress);
      if (progress && progress.stages) {
        const initialCompleted: Record<string, boolean> = {};
        const initialNotes: Record<string, string> = {};
        // Ensure we iterate over stages defined in the guide, falling back to stored progress
        guide?.growing_guide.forEach(stageDef => {
            initialCompleted[stageDef.stage] = progress.stages[stageDef.stage]?.completed || false;
            if (progress.stages[stageDef.stage]?.notes) {
                initialNotes[stageDef.stage] = progress.stages[stageDef.stage].notes!;
            }
        });
        setCompletedStages(initialCompleted);
        setStageNotes(initialNotes);
      } else if (guide) {
        // No saved progress for this planterId, or planterId not yet fully initialized
        // Initialize from guide structure (all incomplete)
        const initialCompleted: Record<string, boolean> = {};
        guide.growing_guide.forEach(stage => {
          initialCompleted[stage.stage] = false;
        });
        setCompletedStages(initialCompleted);
      }
    } else if (guide) {
      // No planterId, means this is a generic view, not tied to a user's specific plan instance
      // Initialize all as incomplete, no persistence
      const initialCompleted: Record<string, boolean> = {};
      guide.growing_guide.forEach(stage => {
        initialCompleted[stage.stage] = false;
      });
      setCompletedStages(initialCompleted);
      setPlantProgressData(null); // Ensure no old data is shown
    }
  }, [planterId, guide]);

  const handleToggleStageCompletion = (stageName: string) => {
    const newCompletedStatus = !completedStages[stageName];
    setCompletedStages(prev => ({ ...prev, [stageName]: newCompletedStatus }));

    if (planterId && guide) {
      let currentPlantProgress = getPlantGuideProgressByPlanterId(planterId);
      if (!currentPlantProgress) {
        // This case implies that an 'add to plan' action should have created this record.
        // As a robust fallback, if we have a planterId but no record, create one.
        // This is crucial if the "Add to Plan" logic hasn't pre-populated stage dates yet.
        // For this function to be effective, stageStartDates/EndDates should ideally already exist.
        console.warn(`No existing progress found for planterId ${planterId}. Creating a new basic record. Stage dates might be missing initially.`);
        currentPlantProgress = {
          plantId: guide.plant_id,
          planterId: planterId,
          addedDate: new Date().toISOString(), // This might not be the true added date if created here
          stageStartDates: {}, // Should be populated by 'add to plan'
          stageEndDates: {},   // Should be populated by 'add to plan'
          stages: {},
        };
      }

      currentPlantProgress.stages[stageName] = {
        ...(currentPlantProgress.stages[stageName] || {}), // Keep existing notes/photos if any
        completed: newCompletedStatus,
      };
      upsertPlantGuideProgress(currentPlantProgress);
      setPlantProgressData(currentPlantProgress); // Update local state to reflect changes (e.g., if dates were part of it)
    }
  };

  if (!guide || !guide.growing_guide || guide.growing_guide.length === 0) {
    return <p className="text-center text-gray-500 dark:text-gray-400">Growing guide not available for this plant.</p>;
  }

  const progress = guide.growing_guide.length > 0 ? (Object.values(completedStages).filter(Boolean).length / guide.growing_guide.length) * 100 : 0;

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl mb-4">
        {guide.common_name} Growing Guide
      </h2>

      {guide.growing_guide.length > 0 && (
        <div className="mb-6">
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-green-700 dark:text-green-500">Overall Progress</span>
            <span className="text-sm font-medium text-green-700 dark:text-green-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        {guide.growing_guide.map((stage, index) => {
          const startDate = plantProgressData?.stageStartDates?.[stage.stage];
          const endDate = plantProgressData?.stageEndDates?.[stage.stage];
          const isCompleted = completedStages[stage.stage] || false;

          return (
            <AccordionItem value={`stage-${index}`} key={stage.stage} className="border-b border-gray-200 dark:border-gray-700">
              <AccordionTrigger
                className={`text-lg font-semibold hover:no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800 rounded-md py-4 px-2 flex flex-col sm:flex-row justify-between items-start sm:items-center w-full text-left`}
              >
                <div className="flex items-center mb-2 sm:mb-0">
                  {isCompleted ? <CheckCircle className="h-6 w-6 mr-3 text-green-500 flex-shrink-0" /> : <Circle className="h-6 w-6 mr-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />}
                  <span className={isCompleted ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-100'}>
                    {stage.stage} (Approx. {stage.duration_days} days)
                  </span>
                </div>
                {planterId && startDate && endDate && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-0 sm:ml-auto pl-9 sm:pl-0 flex items-center">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                  </div>
                )}
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-6 px-2 text-gray-700 dark:text-gray-300">
                <div className="space-y-5">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                    <ClipboardList className="h-5 w-5 mr-2 text-blue-500" /> Instructions:
                  </h4>
                  <ul className="list-disc list-inside pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    {stage.instructions.map((inst, i) => <li key={i}>{inst}</li>)}
                  </ul>
                </div>

                {stage.tools_needed && stage.tools_needed.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                      <Wrench className="h-5 w-5 mr-2 text-indigo-500" /> Tools Needed:
                    </h4>
                    <ul className="list-disc list-inside pl-6 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      {stage.tools_needed.map((tool, i) => <li key={i}>{tool}</li>)}
                    </ul>
                  </div>
                )}

                {stage.media && (stage.media.images || stage.media.video) && (
                  <div className="mt-3">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
                        <ImageIcon className="h-5 w-5 mr-2 text-purple-500" /> Media:
                    </h4>
                    <div className="space-y-3">
                        {stage.media.images && stage.media.images.length > 0 && (
                            <StageImageCarousel images={stage.media.images} stageName={stage.stage} />
                        )}

                        {stage.media.video && (
                        <div className={stage.media.images && stage.media.images.length > 0 ? "mt-3" : ""}>
                            <video
                            controls
                            src={stage.media.video}
                            className="rounded-lg w-full border border-gray-200 dark:border-gray-700 shadow-sm"
                            preload="metadata"
                            >
                            Your browser does not support the video tag.
                            </video>
                        </div>
                        )}
                    </div>
                  </div>
                )}

                {stage.tips && stage.tips.length > 0 && (
                  <CollapsibleInfoSection
                    title="🌟 Tips"
                    icon={<Lightbulb className="h-full w-full" />}
                    items={stage.tips}
                    baseBgColor="bg-blue-50 dark:bg-blue-900/70"
                    borderColor="border-blue-300 dark:border-blue-700"
                    textColor="text-blue-700 dark:text-blue-300"
                    itemTextColor="text-blue-600 dark:text-blue-200 opacity-90"
                    defaultOpen={true}
                  />
                )}

                {stage.warnings && stage.warnings.length > 0 && (
                  <CollapsibleInfoSection
                    title="⚠️ Warnings"
                    icon={<AlertTriangle className="h-full w-full" />}
                    items={stage.warnings}
                    baseBgColor="bg-yellow-50 dark:bg-yellow-800/50"
                    borderColor="border-yellow-300 dark:border-yellow-600"
                    textColor="text-yellow-700 dark:text-yellow-200"
                    itemTextColor="text-yellow-600 dark:text-yellow-100 opacity-90"
                    defaultOpen={true}
                  />
                )}

                {stage.did_you_know && stage.did_you_know.length > 0 && (
                  <CollapsibleInfoSection
                    title="💡 Did You Know?"
                    icon={<Info className="h-full w-full" />}
                    items={stage.did_you_know}
                    baseBgColor="bg-purple-50 dark:bg-purple-900/70"
                    borderColor="border-purple-300 dark:border-purple-700"
                    textColor="text-purple-700 dark:text-purple-300"
                    itemTextColor="text-purple-600 dark:text-purple-200 opacity-90"
                    defaultOpen={false}
                  />
                )}

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Button
                        variant="outline"
                        onClick={() => handleAskAi(stage.stage, guide.common_name, stage.instructions)}
                        className="rounded-full group hover:bg-green-100 dark:hover:bg-green-800/30 transition-colors duration-150 py-2 px-4 text-sm w-full sm:w-auto"
                    >
                        <MessageCircleQuestion className="h-5 w-5 mr-2 text-green-600 dark:text-green-400 transition-transform duration-300 ease-out group-hover:scale-110" />
                        Ask AI for Help
                    </Button>
                    <button
                      disabled={!planterId}
                      onClick={() => handleToggleStageCompletion(stage.stage)}
                      className={`px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors duration-150 ease-in-out
                        ${isCompleted
                          ? 'bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
                          : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'}
                        ${!planterId ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={!planterId ? "Add to a plan to track progress" : (isCompleted ? 'Mark as Incomplete' : 'Mark as Complete')}
                    >
                      {isCompleted ? <CheckCircle className="h-5 w-5 mr-2" /> : <Circle className="h-5 w-5 mr-2" />}
                      {isCompleted ? 'Mark as Incomplete' : 'Mark as Complete'}
                    </button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  );
};

export default GrowingGuideDisplay;
