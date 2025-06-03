'use client';

import { ZoomIn, ZoomOut, Calendar, BookOpen, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimelineView } from '@/types/timeline';

interface TimelineControlsProps {
  view: TimelineView;
  onViewChange: (view: TimelineView) => void;
  onZoom: (zoomIn: boolean) => void;
}

export function TimelineControls({
  view,
  onViewChange,
  onZoom
}: TimelineControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onZoom(false)}
          disabled={view.zoom <= 0.5}
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onZoom(true)}
          disabled={view.zoom >= 2}
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <span className="text-sm text-gray-500">
          {Math.round(view.zoom * 100)}%
        </span>
      </div>

      <Tabs
        value={view.type}
        onValueChange={(value) =>
          onViewChange({
            ...view,
            type: value as 'single' | 'multi'
          })
        }
      >
        <TabsList>
          <TabsTrigger value="single">Single Plant</TabsTrigger>
          <TabsTrigger value="multi">Multiple Plants</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex items-center gap-2">
        <Button
          variant={view.showMilestones ? 'default' : 'outline'}
          size="sm"
          onClick={() =>
            onViewChange({
              ...view,
              showMilestones: !view.showMilestones
            })
          }
        >
          <Calendar className="w-4 h-4 mr-2" />
          Milestones
        </Button>
        <Button
          variant={view.showJournal ? 'default' : 'outline'}
          size="sm"
          onClick={() =>
            onViewChange({
              ...view,
              showJournal: !view.showJournal
            })
          }
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Journal
        </Button>
        <Button
          variant={view.showWeather ? 'default' : 'outline'}
          size="sm"
          onClick={() =>
            onViewChange({
              ...view,
              showWeather: !view.showWeather
            })
          }
        >
          <Cloud className="w-4 h-4 mr-2" />
          Weather
        </Button>
      </div>
    </div>
  );
} 