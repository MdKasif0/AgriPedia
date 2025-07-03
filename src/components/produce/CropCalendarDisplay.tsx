import type { ProduceInfo } from '@/lib/produceData';
import { CalendarDays, Info } from 'lucide-react';

interface CropCalendarDisplayProps {
  produce: ProduceInfo;
}

export default function CropCalendarDisplay({ produce }: CropCalendarDisplayProps) {
  const cycles = produce.plantingAndHarvestCycles;
  const hasPlantingHarvestInfo = typeof cycles === 'string' && cycles.trim() !== "";
  const isCyclesObject = typeof cycles === 'object' && cycles !== null && !Array.isArray(cycles);

  return (
    <div className="text-card-foreground/90">
      {hasPlantingHarvestInfo ? (
        <p className="whitespace-pre-line">{cycles}</p>
      ) : isCyclesObject ? (
        <div className="space-y-1">
          {Object.entries(cycles).map(([month, activity]) => (
            <p key={month}><strong>{month}:</strong> {activity}</p>
          ))}
        </div>
      ) : (
        produce.seasons && produce.seasons.length > 0 ? (
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
            <p>While specific planting and harvesting cycle details aren&apos;t available, this item is typically available in the following seasons: <strong>{produce.seasons.join(', ')}</strong>.</p>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
            <p>Specific crop calendar or seasonal availability information is not available for this item.</p>
          </div>
        )
      )}
    </div>
  );
}
