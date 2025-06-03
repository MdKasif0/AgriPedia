'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, differenceInDays } from 'date-fns';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Calendar, Share2, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PlantTimeline, TimelineView, GrowthStage } from '@/types/timeline';
import { StageCard } from './StageCard';
import { TimelineControls } from './TimelineControls';
import { TimelineExport } from './TimelineExport';

const mockTimeline: PlantTimeline = {
  id: 'timeline_1',
  plantId: 'plant_1',
  plantName: 'Tomato',
  variety: 'Cherry',
  plantingDate: '2024-03-15',
  plantingMethod: 'seed',
  phases: [
    {
      stage: 'germination',
      duration_days: 7,
      description: 'Seed absorbs water and sprouts.',
      key_actions: [
        { action: 'Keep soil moist' },
        { action: 'Maintain warmth (20-25°C)' }
      ],
      icon: '🌱',
      color: '#4CAF50'
    },
    {
      stage: 'seedling',
      duration_days: 14,
      description: 'First true leaves appear.',
      key_actions: [
        { action: 'Sunlight 6+ hours' },
        { action: 'Avoid overwatering' }
      ],
      icon: '🌿',
      color: '#8BC34A'
    },
    {
      stage: 'vegetative',
      duration_days: 30,
      description: 'Rapid growth of leaves and stems.',
      key_actions: [
        { action: 'Fertilize weekly' },
        { action: 'Stake for support' }
      ],
      icon: '🌳',
      color: '#2196F3'
    },
    {
      stage: 'flowering',
      duration_days: 20,
      description: 'Buds and flowers develop.',
      key_actions: [
        { action: 'Pollinate if indoors' },
        { action: 'Watch for pests' }
      ],
      icon: '🌸',
      color: '#E91E63'
    },
    {
      stage: 'fruiting',
      duration_days: 30,
      description: 'Fruits mature and ripen.',
      key_actions: [
        { action: 'Harvest ripe fruit' },
        { action: 'Keep soil nutrient-rich' }
      ],
      icon: '🍅',
      color: '#FF5722'
    }
  ],
  currentPhase: 'vegetative',
  progress: {
    germination: {
      startDate: '2024-03-15',
      endDate: '2024-03-22',
      isCompleted: true
    },
    seedling: {
      startDate: '2024-03-22',
      endDate: '2024-04-05',
      isCompleted: true
    },
    vegetative: {
      startDate: '2024-04-05',
      endDate: '2024-05-05',
      isCompleted: false
    }
  },
  adjustments: [],
  expectedHarvestDate: '2024-06-24'
};

export function SeedToHarvestTimeline() {
  const [view, setView] = useState<TimelineView>({
    type: 'single',
    plants: [mockTimeline],
    startDate: mockTimeline.plantingDate,
    endDate: mockTimeline.expectedHarvestDate,
    zoom: 1,
    showMilestones: true,
    showJournal: true,
    showWeather: true
  });
  const [selectedStage, setSelectedStage] = useState<GrowthStage | null>(null);
  const [showExport, setShowExport] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  const totalDays = differenceInDays(
    new Date(view.endDate),
    new Date(view.startDate)
  );

  const handleScroll = (direction: 'left' | 'right') => {
    if (timelineRef.current) {
      const scrollAmount = 200;
      timelineRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleZoom = (zoomIn: boolean) => {
    setView(prev => ({
      ...prev,
      zoom: Math.max(0.5, Math.min(2, prev.zoom + (zoomIn ? 0.1 : -0.1)))
    }));
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Growth Timeline</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExport(true)}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExport(true)}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <TimelineControls
        view={view}
        onViewChange={setView}
        onZoom={handleZoom}
      />

      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
          onClick={() => handleScroll('left')}
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>

        <div
          ref={timelineRef}
          className="overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <div
            className="relative min-w-full"
            style={{
              width: `${totalDays * view.zoom * 50}px`,
              height: '200px'
            }}
          >
            {/* Today marker */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500"
              style={{
                left: `${differenceInDays(new Date(), new Date(view.startDate)) * view.zoom * 50}px`
              }}
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-sm text-red-500">
                Today
              </div>
            </div>

            {/* Growth phases */}
            {view.plants.map((plant, plantIndex) => (
              <div
                key={plant.id}
                className="absolute top-0 bottom-0"
                style={{
                  top: `${plantIndex * 60}px`
                }}
              >
                {plant.phases.map((phase, phaseIndex) => {
                  const startDay = plant.phases
                    .slice(0, phaseIndex)
                    .reduce((acc, p) => acc + p.duration_days, 0);
                  const width = phase.duration_days * view.zoom * 50;

                  return (
                    <motion.div
                      key={phase.stage}
                      className="absolute h-12 rounded-lg cursor-pointer"
                      style={{
                        left: `${startDay * view.zoom * 50}px`,
                        width: `${width}px`,
                        backgroundColor: phase.color
                      }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedStage(phase.stage)}
                    >
                      <div className="flex items-center h-full px-3 text-white">
                        <span className="mr-2">{phase.icon}</span>
                        <span className="text-sm font-medium">
                          {phase.stage.charAt(0).toUpperCase() + phase.stage.slice(1)}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
          onClick={() => handleScroll('right')}
        >
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>

      <AnimatePresence>
        {selectedStage && (
          <StageCard
            stage={view.plants[0].phases.find(p => p.stage === selectedStage)!}
            onClose={() => setSelectedStage(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExport && (
          <TimelineExport
            timeline={view.plants[0]}
            onClose={() => setShowExport(false)}
          />
        )}
      </AnimatePresence>
    </Card>
  );
} 