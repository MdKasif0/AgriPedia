'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScanResult } from '@/types/health-detector';
import { ScanResultCard } from './ScanResultCard';

interface ScanHistoryProps {
  scans: ScanResult[];
  onFeedback: (scanId: string, isCorrect: boolean, suggestedIssue?: string) => void;
}

export function ScanHistory({ scans, onFeedback }: ScanHistoryProps) {
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);

  if (scans.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">No scans yet. Start by scanning your plant!</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-medium">Scan History</h3>
        <div className="space-y-2">
          {scans.map((scan) => (
            <Card
              key={scan.id}
              className={`p-4 cursor-pointer transition-colors ${
                selectedScan?.id === scan.id ? 'bg-gray-50' : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedScan(scan)}
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden">
                  <img
                    src={scan.imageUrl}
                    alt="Scan thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={
                        scan.detection.status === 'healthy'
                          ? 'default'
                          : scan.detection.status === 'warning'
                          ? 'secondary'
                          : 'destructive'
                      }
                    >
                      {scan.detection.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {format(new Date(scan.timestamp), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {scan.detection.description}
                  </p>
                  {scan.userFeedback && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        Feedback provided
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {selectedScan && (
        <div className="sticky top-4">
          <ScanResultCard
            result={selectedScan}
            onFeedback={onFeedback}
          />
        </div>
      )}
    </div>
  );
} 