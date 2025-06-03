'use client';

import { JournalEntry } from '@/types/journal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Share2, Download, Cloud, CheckSquare } from 'lucide-react';
import Image from 'next/image';

interface JournalTimelineProps {
  entries: JournalEntry[];
  view: 'timeline' | 'gallery';
}

export function JournalTimeline({ entries, view }: JournalTimelineProps) {
  if (view === 'gallery') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {entries.map((entry) => (
          <motion.div
            key={entry.entry_id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <JournalGalleryCard entry={entry} />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {entries.map((entry) => (
        <motion.div
          key={entry.entry_id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <JournalTimelineCard entry={entry} />
        </motion.div>
      ))}
    </div>
  );
}

function JournalTimelineCard({ entry }: { entry: JournalEntry }) {
  return (
    <Card className="p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 relative rounded-lg overflow-hidden">
            {entry.photos[0] ? (
              <Image
                src={entry.photos[0]}
                alt="Plant photo"
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <Cloud className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {format(new Date(entry.date), 'MMMM d, yyyy')}
              </h3>
              <p className="text-sm text-gray-500">
                {entry.growth_stage} Stage
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <p className="mt-2 text-gray-700">{entry.note}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {entry.task_summary.map((task) => (
              <span
                key={task}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                <CheckSquare className="w-3 h-3 mr-1" />
                {task}
              </span>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Cloud className="w-4 h-4 mr-1" />
              {entry.weather_info.temperature}, {entry.weather_info.condition}
            </div>
            <div>
              Plant Mood: {entry.plant_mood}
            </div>
            <div>
              Your Mood: {entry.user_mood}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function JournalGalleryCard({ entry }: { entry: JournalEntry }) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-square relative">
        {entry.photos[0] ? (
          <Image
            src={entry.photos[0]}
            alt="Plant photo"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Cloud className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            {format(new Date(entry.date), 'MMM d, yyyy')}
          </h3>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{entry.note}</p>

        <div className="mt-3 flex flex-wrap gap-1">
          {entry.task_summary.slice(0, 2).map((task) => (
            <span
              key={task}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
            >
              <CheckSquare className="w-3 h-3 mr-1" />
              {task}
            </span>
          ))}
          {entry.task_summary.length > 2 && (
            <span className="text-xs text-gray-500">
              +{entry.task_summary.length - 2} more
            </span>
          )}
        </div>
      </div>
    </Card>
  );
} 