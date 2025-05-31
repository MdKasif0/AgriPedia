'use client';

import React, { useState } from 'react';
import plantGrowthStagesData from '@/lib/data/plantGrowthStages.json';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Assuming shadcn/ui select
import { CalendarDays, BarChart3 } from 'lucide-react';

interface Stage {
  name: string;
  durationDays: number;
}

interface PlantStagesData {
  id: string;
  plantName: string;
  totalDurationDays: number;
  stages: Stage[];
}

interface CalculatedStage extends Stage {
  startDay: number;
  endDay: number;
  status: 'completed' | 'current' | 'future';
  progressWithinStage?: number; // for current stage
}

interface CalculatedTimelineData {
  plant: PlantStagesData;
  daysPassed: number;
  currentStageName: string;
  overallProgressPercent: number;
  stagesWithProgress: CalculatedStage[];
}

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => new Date().toISOString().split('T')[0];

export default function SeedToHarvestTimeline() {
  const [selectedPlantIdForTimeline, setSelectedPlantIdForTimeline] = useState<string>('');
  const [plantingDate, setPlantingDate] = useState<string>(getTodayDate());
  const [timelineData, setTimelineData] = useState<CalculatedTimelineData | null>(null);

  const handleShowTimeline = () => {
    if (!selectedPlantIdForTimeline || !plantingDate) {
      alert('Please select a plant and a planting date.');
      return;
    }

    const selectedPlantData = plantGrowthStagesData.find(p => p.id === selectedPlantIdForTimeline) as PlantStagesData | undefined;
    if (!selectedPlantData) {
      alert('Selected plant data not found.');
      return;
    }

    const startDate = new Date(plantingDate);
    const today = new Date();
    const daysPassed = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    let overallProgressPercent = Math.min(100, Math.max(0, (daysPassed / selectedPlantData.totalDurationDays) * 100));
    if (daysPassed > selectedPlantData.totalDurationDays) overallProgressPercent = 100;


    let currentStageName = "Not Started";
    let cumulativeDays = 0;
    const stagesWithProgress: CalculatedStage[] = selectedPlantData.stages.map(stage => {
      const stageStartDay = cumulativeDays;
      cumulativeDays += stage.durationDays;
      const stageEndDay = cumulativeDays;
      let status: 'completed' | 'current' | 'future' = 'future';
      let progressWithinStage: number | undefined = undefined;

      if (daysPassed >= stageEndDay) {
        status = 'completed';
      } else if (daysPassed >= stageStartDay && daysPassed < stageEndDay) {
        status = 'current';
        currentStageName = stage.name;
        progressWithinStage = ((daysPassed - stageStartDay) / stage.durationDays) * 100;
      }

      return { ...stage, startDay: stageStartDay, endDay: stageEndDay, status, progressWithinStage };
    });

    if (daysPassed === 0 && selectedPlantData.stages.length > 0) {
        currentStageName = selectedPlantData.stages[0].name + " (Pending)";
    } else if (daysPassed > selectedPlantData.totalDurationDays) {
        currentStageName = "Harvested/Cycle Complete";
    } else if (currentStageName === "Not Started" && stagesWithProgress.find(s => s.status === 'current')) {
        // This case should be handled by the loop above, but as a fallback
        currentStageName = stagesWithProgress.find(s => s.status === 'current')?.name || "Unknown";
    }


    setTimelineData({
      plant: selectedPlantData,
      daysPassed,
      currentStageName,
      overallProgressPercent,
      stagesWithProgress,
    });
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white h-full flex flex-col">
      <h3 className="text-xl font-semibold mb-1 text-gray-800">Seed-to-Harvest Timeline</h3>
      <p className="text-sm text-gray-600 mb-4">
        Visualize your plant's growth progress from seed to harvest.
      </p>

      <div className="mb-4 p-3 border border-gray-200 rounded-md bg-gray-50 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-grow">
            <label htmlFor="plant-select-timeline" className="block text-xs font-medium text-gray-700 mb-0.5">Select Plant:</label>
            <Select value={selectedPlantIdForTimeline} onValueChange={setSelectedPlantIdForTimeline}>
              <SelectTrigger id="plant-select-timeline" className="w-full text-sm">
                <SelectValue placeholder="Choose a plant type" />
              </SelectTrigger>
              <SelectContent>
                {plantGrowthStagesData.map(plant => (
                  <SelectItem key={plant.id} value={plant.id} className="text-sm">
                    {plant.plantName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:w-auto">
            <label htmlFor="planting-date-timeline" className="block text-xs font-medium text-gray-700 mb-0.5">Planting Date:</label>
            <Input
              id="planting-date-timeline"
              type="date"
              value={plantingDate}
              onChange={e => setPlantingDate(e.target.value)}
              className="w-full text-sm"
            />
          </div>
        </div>
        <Button onClick={handleShowTimeline} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white text-sm py-1.5 px-3">
          <BarChart3 size={16} className="mr-1.5" /> Show Timeline
        </Button>
      </div>

      {timelineData ? (
        <div className="flex-grow overflow-y-auto pt-2 min-h-[200px]">
          <h4 className="text-lg font-semibold text-gray-700 mb-1">
            Timeline for: {timelineData.plant.plantName}
          </h4>
          <p className="text-sm text-gray-600">
            Planted on: {new Date(plantingDate).toLocaleDateString()} ({timelineData.daysPassed} days ago)
          </p>
          <p className="text-sm text-gray-600 font-medium">
            Overall Progress: {timelineData.overallProgressPercent.toFixed(0)}%
          </p>
          <p className="text-sm text-gray-600 font-medium mb-3">
            Current Stage: {timelineData.currentStageName}
          </p>

          <div className="space-y-1.5 text-xs">
            <div className="flex w-full bg-gray-200 rounded-full h-6 overflow-hidden border border-gray-300">
              {timelineData.stagesWithProgress.map(stage => {
                const stageWidth = (stage.durationDays / timelineData.plant.totalDurationDays) * 100;
                let bgColor = 'bg-gray-300'; // Future
                if (stage.status === 'completed') bgColor = 'bg-green-500';
                if (stage.status === 'current') bgColor = 'bg-yellow-400';

                return (
                  <div
                    key={stage.name}
                    style={{ width: `${stageWidth}%` }}
                    className={`h-full flex items-center justify-center text-white/90 font-medium transition-all duration-500 ease-out ${bgColor} relative group`}
                    title={`${stage.name} (${stage.durationDays} days)`}
                  >
                    <span className="truncate px-1 text-[10px] sm:text-xs opacity-80 group-hover:opacity-100">
                      {stage.name.substring(0,3)}
                    </span>
                     {stage.status === 'current' && stage.progressWithinStage !== undefined && (
                        <div
                            className="absolute top-0 left-0 h-full bg-green-600/50 opacity-50"
                            style={{ width: `${stage.progressWithinStage}%`}}
                        ></div>
                     )}
                  </div>
                );
              })}
            </div>
            {/* Legend / Detailed Stage List */}
            <ul className="space-y-1 mt-3">
                {timelineData.stagesWithProgress.map(stage => (
                    <li key={stage.name + "-detail"} className="flex items-center p-1.5 border rounded-md">
                        <span className={`w-3 h-3 rounded-full mr-2 ${
                            stage.status === 'completed' ? 'bg-green-500' :
                            stage.status === 'current' ? 'bg-yellow-400' : 'bg-gray-300'
                        }`}></span>
                        <span className="flex-grow text-gray-700">{stage.name} ({stage.durationDays} days)</span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                             stage.status === 'completed' ? 'bg-green-100 text-green-700' :
                             stage.status === 'current' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                            {stage.status === 'current' && stage.progressWithinStage !== undefined ?
                                `${stage.progressWithinStage.toFixed(0)}%` : stage.status}
                        </span>
                    </li>
                ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center text-gray-500 p-5">
          <CalendarDays size={32} className="mb-2 text-gray-400" />
          <p>Select a plant and planting date to visualize its growth timeline.</p>
        </div>
      )}
    </div>
  );
}
