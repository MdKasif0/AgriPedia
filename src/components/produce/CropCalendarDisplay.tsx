import type { ProduceInfo } from '@/lib/produceData';
import { CalendarDays, Info } from 'lucide-react';

interface CropCalendarDisplayProps {
  produce: ProduceInfo;
}

export default function CropCalendarDisplay({ produce }: CropCalendarDisplayProps) {
  const hasPlantingHarvestInfo = produce.plantingAndHarvestCycles && produce.plantingAndHarvestCycles.trim() !== "";

  return (
    <div className="text-card-foreground/90">
      {hasPlantingHarvestInfo ? (
        <p className="whitespace-pre-line">{produce.plantingAndHarvestCycles}</p>
      ) : (
        produce.seasons && produce.seasons.length > 0 ? (
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 mt-1 text-muted-foreground shrink-0" />
            <p>While specific planting and harvesting cycle details aren't available, this item is typically available in the following seasons: <strong>{produce.seasons.join(', ')}</strong>.</p>
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
