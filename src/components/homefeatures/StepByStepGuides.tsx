import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { motion, AnimatePresence } from 'framer-motion';
import { ProduceInfo, GrowingStage } from '@/lib/produceData';
import { getPlantGrowProgress, updateStageCompletion } from '@/lib/userDataStore';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  BellRing, Settings2, Info, Star, AlertTriangle, Lightbulb, ChevronDown, ChevronUp,
  PlayCircle, Image as ImageIcon, ChevronLeft, ChevronRight, Circle,
  Brain, // Icon for Ask AI button
  Printer // Icon for Print button
} from 'lucide-react';

// Placeholder icons
const ToolIcon = () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline-block text-slate-600 dark:text-slate-400"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" /></svg>;
// Removed old ImagePlaceholder and VideoPlaceholder as they will be replaced by new components/logic

import type { PlannerData } from '@/types/planner'; // Import PlannerData type

interface StepByStepGuidesProps {
  produce: ProduceInfo;
  /** A unique identifier for this specific plant instance, combining produce ID, user, and potentially plot.
   * Example: "basil_user123_plotA"
   */
  plantInstanceId: string;
  plannerData?: Partial<PlannerData>; // Add plannerData prop
}

const DynamicPlannerTips: React.FC<{ plannerData: Partial<PlannerData> }> = ({ plannerData }) => {
  const tips = [];

  if (plannerData.location?.climateZone) {
    const climateZone = plannerData.location.climateZone.toLowerCase();
    if (climateZone.includes("tropical") || climateZone.includes("humid")) {
      tips.push("🌿 *Climate Tip:* In your humid climate, ensure good air circulation and water less frequently if the soil stays moist.");
    }
  }

  if (plannerData.growingSpace) {
    const space = plannerData.growingSpace.toLowerCase();
    if (space.includes("indoor") || space.includes("pots") || space.includes("containers")) {
      tips.push("🌿 *Space Tip:* Growing indoors? Remember to rotate your plant regularly for even light exposure if it's not directly under a grow light.");
    }
  }

  if (plannerData.experienceLevel) { // Ensure correct field name from PlannerData
    const experience = plannerData.experienceLevel.toLowerCase();
    if (experience.includes("intermediate") || experience.includes("advanced")) {
      tips.push("🌿 *Pro Tip:* Consider using a soil moisture meter for precise watering, especially for sensitive plants.");
    }
  }

  if (tips.length === 0) {
    return null;
  }

  return (
    <div className="my-4 p-3 border border-purple-200 dark:border-purple-700/50 bg-purple-50 dark:bg-purple-900/30 rounded-lg shadow-sm">
      <h5 className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1.5">Personalized Planting Insights:</h5>
      <ul className="list-none pl-0 space-y-1">
        {tips.map((tip, index) => (
          <li key={index} className="text-xs text-purple-600 dark:text-purple-200 italic">
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};

const StepByStepGuides: React.FC<StepByStepGuidesProps> = ({ produce, plantInstanceId, plannerData }) => {
  const { growing_guide, id: produceId, commonName } = produce;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [completedStageNames, setCompletedStageNames] = useState<string[]>([]);
  const [currentNotes, setCurrentNotes] = useState<{ [stageName: string]: string }>({});
  const [openCollapsibles, setOpenCollapsibles] = useState<{ [key: string]: boolean }>({});
  const [currentImageIndices, setCurrentImageIndices] = useState<{ [stageName: string]: number }>({});
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    if (!plantInstanceId || !growing_guide) return;

    const progress = getPlantGrowProgress(plantInstanceId);
    let initialCompletedStages: string[] = [];
    if (progress && progress.completedStages) {
      initialCompletedStages = progress.completedStages;
      setCompletedStageNames(initialCompletedStages);
    }

    if (growing_guide.length > 0) {
      const firstUncompletedIndex = growing_guide.findIndex(
        stage => !initialCompletedStages.includes(stage.stage)
      );
      if (firstUncompletedIndex !== -1) {
        setActiveIndex(firstUncompletedIndex);
      } else if (initialCompletedStages.length === growing_guide.length) {
        setActiveIndex(growing_guide.length - 1); // All complete, open last
      } else {
        setActiveIndex(0); // Default to first stage
      }
    }
    // TODO: Load notes from progress.stageLogs
  }, [plantInstanceId, growing_guide]);

  if (!growing_guide || growing_guide.length === 0) {
    return <p className="text-center text-slate-600 dark:text-slate-400 py-8">No growing guide available for this produce.</p>;
  }

  const toggleStage = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleToggleComplete = (stageName: string, currentCompletionStatus: boolean) => {
    const newCompletionStatus = !currentCompletionStatus;
    updateStageCompletion(plantInstanceId, produceId, stageName, newCompletionStatus);

    const updatedCompletedNames = newCompletionStatus
      ? [...completedStageNames, stageName]
      : completedStageNames.filter(name => name !== stageName);
    setCompletedStageNames(updatedCompletedNames);

    if (newCompletionStatus && growing_guide) {
      const currentIndex = growing_guide.findIndex(s => s.stage === stageName);
      if (currentIndex !== -1 && currentIndex < growing_guide.length - 1) {
        const nextStage = growing_guide[currentIndex + 1];
        toast({
          title: "Stage Complete!",
          description: `Next stage '${nextStage.stage}' has begun for ${commonName}!`,
        });
        setActiveIndex(currentIndex + 1); // Open next stage
      } else if (updatedCompletedNames.length === growing_guide.length) {
         toast({
          title: "All Stages Complete!",
          description: `Congratulations on completing all growing stages for ${commonName}!`,
          variant: "default",
        });
      }
    }
  };

  const handleSimulateReminder = (reminderText: string) => {
    toast({
      title: `Reminder for ${commonName}`,
      description: reminderText,
    });
  };

  const handleNoteChange = (stageName: string, notes: string) => {
    setCurrentNotes(prev => ({ ...prev, [stageName]: notes }));
  };

  const handleSaveNote = (stageName: string) => {
    // Placeholder for saving note - using addPlantLog from userDataStore eventually
    console.log(`Save note for ${plantInstanceId}, stage "${stageName}": ${currentNotes[stageName]}`);
    // Example: addPlantLog(plantInstanceId, produceId, stageName, { notes: currentNotes[stageName] });
    alert(`Note for stage "${stageName}" logged (see console). Integration with userDataStore.addPlantLog pending.`);
  };

  const totalStages = growing_guide.length;
  const completedCount = completedStageNames.length;

  return (
    <div className="step-by-step-guide-container w-full max-w-3xl mx-auto p-4 sm:p-6 bg-white dark:bg-slate-900 rounded-xl shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 flex-grow">{produce.commonName} Growing Guide</h2>
        <Button
          variant="outline"
          size="icon"
          onClick={() => window.print()}
          className="print-hide ml-4 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Print Guide"
        >
          <Printer className="h-5 w-5 text-slate-600 dark:text-slate-300" />
        </Button>
      </div>
      <p className="text-center text-slate-600 dark:text-slate-400 mb-8">Follow these stages to successfully grow your own {produce.commonName.toLowerCase()}.</p>

      {/* Progress Tracker */}
      <div className="mb-8 px-2 progress-bar-container">
        <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
          <span>Overall Progress</span>
          <span>{completedCount} / {totalStages} Stages</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3.5 shadow-inner">
          <motion.div
            className="bg-green-500 dark:bg-green-600 h-3.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: totalStages > 0 ? `${(completedCount / totalStages) * 100}%` : '0%' }}
            transition={{ duration: 0.6, ease: "circOut" }}
          />
        </div>
      </div>

      {/* Timeline/Accordion */}
      <div className="space-y-3 guide-stages-accordion">
        {growing_guide.map((stage, index) => {
          const isStageComplete = completedStageNames.includes(stage.stage);
          return (
            <div key={stage.stage + index} className="stage-accordion-item bg-slate-50 dark:bg-slate-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg focus-within:shadow-lg">
              <button
                onClick={() => toggleStage(index)}
                className="stage-header-button w-full flex justify-between items-center p-4 sm:p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:focus-visible:ring-green-400 focus-visible:ring-opacity-75"
                aria-expanded={activeIndex === index}
                aria-controls={`stage-content-${index}`}
              >
                <div className="flex items-center">
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-3 sm:mr-4 transition-all duration-300 ring-2 ring-offset-2 dark:ring-offset-slate-800 ${isStageComplete ? 'bg-green-500 dark:bg-green-600 ring-green-300 dark:ring-green-500' : 'bg-slate-300 dark:bg-slate-600 ring-slate-200 dark:ring-slate-500'}`}>
                    {isStageComplete ?
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-white"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" /></svg> :
                      <span className="text-base font-semibold text-slate-700 dark:text-slate-200">{index + 1}</span>}
                  </div>
                  <div>
                    <span className="font-semibold text-lg text-slate-800 dark:text-slate-100">{stage.stage}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">Est. Duration: {stage.duration_days} days</span>
                </div>
              </div>
              <motion.div
                animate={{ rotate: activeIndex === index ? 90 : 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="text-slate-500 dark:text-slate-400"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
              </motion.div>
            </button>
            <AnimatePresence initial={false}>
              {activeIndex === index && (
                <motion.section
                  id={`stage-content-${index}`}
                  role="region"
                  initial="collapsed"
                  animate="open"
                  exit="collapsed"
                  variants={{
                    open: { opacity: 1, height: 'auto', y: 0, transition: { duration: 0.35, ease: 'easeInOut' } },
                    collapsed: { opacity: 0, height: 0, y: -15, transition: { duration: 0.25, ease: 'easeOut' } },
                  }}
                  className="px-4 sm:px-6 pb-5 pt-3 border-t border-slate-200 dark:border-slate-700/60"
                >
                  <div className="prose prose-sm sm:prose dark:prose-invert max-w-none prose-slate dark:prose-p:text-slate-300 prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-headings:text-slate-700 dark:prose-headings:text-slate-200">
                    <h4>Instructions:</h4>
                    <ul>
                      {stage.instructions.map((instr, i) => <li key={i}>{instr}</li>)}
                    </ul>

                    {stage.tools_needed && stage.tools_needed.length > 0 && (
                      <>
                        <h4><ToolIcon /> Tools Needed:</h4>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {stage.tools_needed.map((tool, i) => (
                            <span key={i} className="text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-full">
                              {tool}
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    {stage.media && (stage.media.images || stage.media.video) && (
                      <>
                        <h4 className="!mt-4 !mb-2">Media Resources:</h4>
                        <div className="mb-4 space-y-4">
                          {/* Image Display Logic */}
                          {stage.media.images && stage.media.images.length > 0 && (
                            <div className="p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30">
                              {stage.media.images.length === 1 ? (
                                <img
                                  src={`https://via.placeholder.com/600x400.png?text=${encodeURIComponent(stage.media.images[0])}`}
                                  alt={stage.media.images[0]}
                                  loading="lazy"
                                  className="w-full h-auto rounded-md shadow-sm max-h-80 object-contain"
                                />
                              ) : (
                                <div className="relative">
                                  <img
                                    src={`https://via.placeholder.com/600x400.png?text=${encodeURIComponent(stage.media.images[currentImageIndices[stage.stage] || 0])}`}
                                    alt={stage.media.images[currentImageIndices[stage.stage] || 0]}
                                    loading="lazy"
                                    className="w-full h-auto rounded-md shadow-sm max-h-80 object-contain"
                                  />
                                  {stage.media.images.length > 1 && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-none h-8 w-8 sm:h-10 sm:w-10"
                                        onClick={() => setCurrentImageIndices(prev => ({
                                          ...prev,
                                          [stage.stage]: ((prev[stage.stage] || 0) - 1 + stage.media.images!.length) % stage.media.images!.length
                                        }))}
                                      >
                                        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className="carousel-control absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white border-none h-8 w-8 sm:h-10 sm:w-10"
                                        onClick={() => setCurrentImageIndices(prev => ({
                                          ...prev,
                                          [stage.stage]: ((prev[stage.stage] || 0) + 1) % stage.media.images!.length
                                        }))}
                                      >
                                        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                                      </Button>
                                      <div className="carousel-dots absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
                                        {stage.media.images.map((_, k) => (
                                          <button
                                            key={k}
                                            onClick={() => setCurrentImageIndices(prev => ({ ...prev, [stage.stage]: k }))}
                                            className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full transition-all duration-200 ${ (currentImageIndices[stage.stage] || 0) === k ? 'bg-white scale-125 ring-1 ring-black/50' : 'bg-white/50 hover:bg-white/80'}`}
                                            aria-label={`Go to image ${k + 1}`}
                                          />
                                        ))}
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                          {/* Video Display Logic */}
                          {stage.media.video && (
                            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/30 flex flex-col items-center justify-center text-center min-h-[200px]">
                              <PlayCircle className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-2" />
                              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Video available:</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{stage.media.video}</p>
                              <Button variant="outline" size="sm" className="mt-3 text-xs" disabled>Watch Video (Coming Soon)</Button>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {stage.tips && stage.tips.length > 0 && (
                      <div className="p-3.5 my-4 bg-sky-50 dark:bg-sky-500/10 border border-sky-200 dark:border-sky-500/30 rounded-lg">
                        <h4 className="!mt-0 !mb-1.5 text-sky-700 dark:text-sky-300 font-semibold">💡 Helpful Tips:</h4>
                        <ul className="!my-0 !list-none !pl-0 space-y-1">
                          {stage.tips.map((tip, i) => <li key={i} className="before:content-['–'] before:mr-2 before:text-sky-500 dark:before:text-sky-400">{tip}</li>)}
                        </ul>
                      </div>
                    )}

                    {stage.tips && stage.tips.length > 0 && (
                      <div className="p-3.5 my-4 bg-sky-50 dark:bg-sky-900/40 border border-sky-200 dark:border-sky-700/50 rounded-lg">
                        <h4 className="!mt-0 !mb-1.5 text-sky-700 dark:text-sky-300 font-semibold flex items-center">
                           <Info className="w-4 h-4 mr-2" /> Helpful Tips:
                        </h4>
                        <ul className="!my-0 !list-none !pl-0 space-y-1 text-sm">
                          {stage.tips.map((tip, i) => <li key={i} className="dark:text-sky-200 text-sky-700 before:content-['–'] before:mr-2 before:text-sky-500 dark:before:text-sky-400">{tip}</li>)}
                        </ul>
                      </div>
                    )}

                    {stage.reminders && stage.reminders.length > 0 && (
                       <div className="p-3.5 my-4 bg-amber-50 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-700/50 rounded-lg">
                        <h4 className="!mt-0 !mb-1.5 text-amber-700 dark:text-amber-300 font-semibold flex items-center">
                          <BellRing className="w-4 h-4 mr-2" /> Important Reminders:
                        </h4>
                        <ul className="!my-0 !list-none !pl-0 space-y-2">
                          {stage.reminders.map((reminder, i) => (
                            <li key={i} className="flex flex-col sm:flex-row justify-between sm:items-center">
                              <span className="text-sm dark:text-amber-200 text-amber-700 mb-1 sm:mb-0">
                                {`– ${reminder}`}
                              </span>
                              <Button
                                variant="outline"
                                size="xs" // Using a smaller button
                                onClick={() => handleSimulateReminder(reminder)}
                                className="simulate-reminder-button text-xs self-start sm:self-center bg-amber-100 dark:bg-amber-800/60 hover:bg-amber-200 dark:hover:bg-amber-700/80 border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-200 px-2 py-1"
                              >
                                Simulate Reminder
                              </Button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Micro Tips/Warnings Section */}
                    {stage.micro_tips_warnings && stage.micro_tips_warnings.length > 0 && (
                      <div className="micro-tips-warnings-container my-4 space-y-3 pt-3 border-t border-dashed border-slate-300 dark:border-slate-700 ">
                        <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 !mt-0 !mb-2">Quick Notes & Alerts:</h4>
                        {stage.micro_tips_warnings.map((item, itemIndex) => {
                          const microItem = item as { type: string; content: string; collapsible?: boolean }; // Type assertion
                          const uniqueKey = `${stage.stage}-micro-${itemIndex}`;
                          const isOpen = openCollapsibles[uniqueKey];
                          let itemIcon, itemBgColor, itemTextColor, itemBorderColor, itemTitle;

                          switch (item.type) {
                            case 'tip':
                              itemIcon = <Star className="w-5 h-5 mr-2 text-green-500 dark:text-green-400 flex-shrink-0" />;
                              itemBgColor = 'bg-green-50 dark:bg-green-700/20';
                              itemTextColor = 'text-green-700 dark:text-green-300';
                              itemBorderColor = 'border-green-200 dark:border-green-600/30';
                              itemTitle = 'Quick Tip';
                              break;
                            case 'warning':
                              itemIcon = <AlertTriangle className="w-5 h-5 mr-2 text-yellow-500 dark:text-yellow-400 flex-shrink-0" />;
                              itemBgColor = 'bg-yellow-50 dark:bg-yellow-700/20';
                              itemTextColor = 'text-yellow-700 dark:text-yellow-300';
                              itemBorderColor = 'border-yellow-200 dark:border-yellow-600/30';
                              itemTitle = 'Heads Up!';
                              break;
                            case 'did_you_know':
                              itemIcon = <Lightbulb className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400 flex-shrink-0" />;
                              itemBgColor = 'bg-blue-50 dark:bg-blue-700/20';
                              itemTextColor = 'text-blue-700 dark:text-blue-300';
                              itemBorderColor = 'border-blue-200 dark:border-blue-600/30';
                              itemTitle = 'Did You Know?';
                              break;
                            default: // Should not happen with defined types, but good fallback
                              itemIcon = <Info className="w-5 h-5 mr-2 flex-shrink-0" />;
                              itemBgColor = 'bg-slate-100 dark:bg-slate-700/30';
                              itemTextColor = 'text-slate-700 dark:text-slate-300';
                              itemBorderColor = 'border-slate-200 dark:border-slate-600/30';
                              itemTitle = 'Note';
                          }

                          return (
                            <div key={uniqueKey} className={`p-3 rounded-lg border ${itemBorderColor} ${itemBgColor} shadow-sm`}>
                              <div
                                className={`flex justify-between items-center ${item.collapsible ? 'cursor-pointer hover:opacity-80' : ''}`}
                                onClick={() => item.collapsible && setOpenCollapsibles(prev => ({...prev, [uniqueKey]: !prev[uniqueKey]}))}
                              >
                                <div className={`flex items-center font-semibold ${itemTextColor} text-sm`}>
                                  {itemIcon} {itemTitle}
                                </div>
                                {item.collapsible && (isOpen ? <ChevronUp className={`w-5 h-5 ${itemTextColor}`} /> : <ChevronDown className={`w-5 h-5 ${itemTextColor}`} />)}
                              </div>
                              <AnimatePresence initial={false}>
                                {(!item.collapsible || isOpen) && (
                                  <motion.div
                                    initial="collapsed"
                                    animate="open"
                                    exit="collapsed"
                                    variants={{
                                      open: { opacity: 1, height: 'auto', marginTop: '10px', y: 0 },
                                      collapsed: { opacity: 0, height: 0, marginTop: '0px', y: -5 },
                                    }}
                                    transition={{ duration: 0.2, ease: 'easeOut' }}
                                    className={`text-sm ${itemTextColor} overflow-hidden prose-p:!my-1 prose-ul:!my-1`}
                                  >
                                    {item.content}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Stage Log UI (Optional) */}
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700/60"> {/* This div is part of the original structure */}

                    {/* Dynamic Planner Tips */}
                    {plannerData && Object.keys(plannerData).length > 0 && (
                       <DynamicPlannerTips plannerData={plannerData} />
                    )}

                    {/* Ask AI Button */}
                    <div className="my-6 text-center ask-ai-button-container">
                      <Button
                        variant="outline"
                        className="bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-700/30 dark:hover:bg-indigo-700/50 border-indigo-300 dark:border-indigo-600 text-indigo-600 dark:text-indigo-300 group"
                        onClick={() => {
                          const contextMessage = `I have a question about my ${commonName} during the ${stage.stage} stage.`;
                          router.push(`/chat?contextMessage=${encodeURIComponent(contextMessage)}`);
                        }}
                      >
                        <Brain className="w-4 h-4 mr-2 group-hover:animate-pulse" /> Ask AI for Help with this Stage
                      </Button>
                    </div>

                    <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-2">Stage Log:</h4>
                    <textarea
                      placeholder="Add notes for this stage..."
                      value={currentNotes[stage.stage] || ''}
                      onChange={(e) => handleNoteChange(stage.stage, e.target.value)}
                      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-slate-200 text-sm"
                      rows={3}
                    />
                    <div className="flex items-center justify-end gap-2 mt-2">
                       <input type="file" id={`file-upload-${index}`} className="hidden" disabled />
                       <label
                         htmlFor={`file-upload-${index}`}
                         className="text-xs px-3 py-1.5 rounded-md bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 cursor-not-allowed opacity-50"
                       >
                         Upload Photo (Soon)
                       </label>
                      <button
                        onClick={() => handleSaveNote(stage.stage)}
                        className="text-xs px-3 py-1.5 rounded-md bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>

                  {/* Notification Preferences Placeholder */}
                  {index === activeIndex && (
                    <div className="mt-8 pt-4 border-t border-dashed border-slate-300 dark:border-slate-700 notification-preferences-container">
                      <h4 className="text-md font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center">
                        <Settings2 className="w-5 h-5 mr-2 text-slate-500 dark:text-slate-400" /> Notification Preferences
                      </h4>
                      <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-md">
                        <div className="flex items-center justify-between">
                          <label htmlFor={`freq-${index}`} className="text-xs">Reminder Frequency:</label>
                          <select id={`freq-${index}`} disabled className="p-1 border rounded text-xs bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-not-allowed">
                            <option>Daily Summary</option>
                            <option>Stage Start/End</option>
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <label htmlFor={`sound-${index}`} className="text-xs">Enable Sounds:</label>
                          <input type="checkbox" id={`sound-${index}`} disabled className="form-checkbox h-4 w-4 cursor-not-allowed accent-slate-400 dark:accent-slate-500"/>
                        </div>
                         <p className="text-xs text-slate-400 dark:text-slate-500 italic text-center">Full notification settings are managed globally (coming soon).</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 mb-2 text-right mark-complete-container">
                    <label className="inline-flex items-center cursor-pointer group p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={isStageComplete}
                        onChange={() => handleToggleComplete(stage.stage, isStageComplete)}
                        className="form-checkbox h-5 w-5 text-green-600 dark:text-green-500 rounded border-slate-400 dark:border-slate-500 bg-transparent dark:bg-slate-700 focus:ring-2 focus:ring-green-500 dark:focus:ring-offset-slate-800"
                      />
                      <span className="ml-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                        Mark Stage as Complete
                      </span>
                    </label>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// This export is for Next.js pages or if you want to import it for direct use in app.
export default StepByStepGuides;

// Example usage for a dedicated test page (e.g., pages/dev/guides-test.tsx)
/*
import { StepByStepGuides } from './StepByStepGuides'; // Adjust path if needed
import someProduceData from '@/lib/data/herbsAndSpices/basil.json'; // Example data
import { Toaster } from "@/components/ui/toaster"; // Required for useToast

export const StepByStepGuidesTestPage: React.FC = () => {
  const commonName = someProduceData.commonName; // Or any other way to get it
  return (
    <>
      <Toaster />
      <div className="p-4 bg-slate-100 dark:bg-slate-950 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-3xl">
          <StepByStepGuides
            produce={someProduceData as unknown as ProduceInfo}
            plantInstanceId={`${someProduceData.id}_userTest_gardenPlot1`}
          />
        </div>
      </div>
    </>
  );
};
*/
