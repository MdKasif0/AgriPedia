'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, Share2, Link, Image, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PlantTimeline, TimelineExport as TimelineExportType } from '@/types/timeline';

interface TimelineExportProps {
  timeline: PlantTimeline;
  onClose: () => void;
}

export function TimelineExport({ timeline, onClose }: TimelineExportProps) {
  const [exportOptions, setExportOptions] = useState<TimelineExportType>({
    format: 'pdf',
    includePhotos: true,
    includeJournal: true,
    includeWeather: true
  });

  const handleExport = () => {
    // Implement export logic based on options
    console.log('Exporting with options:', exportOptions);
    onClose();
  };

  const handleShare = () => {
    // Implement share logic
    console.log('Sharing timeline');
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <Card className="w-full max-w-lg p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Export Timeline</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Format</h4>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={exportOptions.format === 'pdf' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setExportOptions(prev => ({ ...prev, format: 'pdf' }))}
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                variant={exportOptions.format === 'image' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setExportOptions(prev => ({ ...prev, format: 'image' }))}
              >
                <Image className="w-4 h-4 mr-2" />
                Image
              </Button>
              <Button
                variant={exportOptions.format === 'link' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setExportOptions(prev => ({ ...prev, format: 'link' }))}
              >
                <Link className="w-4 h-4 mr-2" />
                Link
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Include</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={exportOptions.includePhotos}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({
                      ...prev,
                      includePhotos: checked as boolean
                    }))
                  }
                />
                <span>Photos</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={exportOptions.includeJournal}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({
                      ...prev,
                      includeJournal: checked as boolean
                    }))
                  }
                />
                <span>Journal Entries</span>
              </label>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={exportOptions.includeWeather}
                  onCheckedChange={(checked) =>
                    setExportOptions(prev => ({
                      ...prev,
                      includeWeather: checked as boolean
                    }))
                  }
                />
                <span>Weather Data</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              className="flex-1"
              onClick={handleExport}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
} 