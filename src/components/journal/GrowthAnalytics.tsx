'use client';

import { JournalEntry, GrowthStage } from '@/types/journal';
import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface GrowthAnalyticsProps {
  entries: JournalEntry[];
}

export function GrowthAnalytics({ entries }: GrowthAnalyticsProps) {
  const heightData = entries
    .filter(entry => entry.height !== undefined)
    .map(entry => ({
      date: format(parseISO(entry.date), 'MMM d'),
      height: entry.height,
    }));

  const stageData = Object.entries(
    entries.reduce((acc, entry) => {
      acc[entry.growth_stage] = (acc[entry.growth_stage] || 0) + 1;
      return acc;
    }, {} as Record<GrowthStage, number>)
  ).map(([stage, count]) => ({
    stage,
    count,
  }));

  const wateringFrequency = entries.reduce((acc, entry) => {
    if (entry.task_summary.includes('Watered')) {
      acc++;
    }
    return acc;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Height Progress</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={heightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="height"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Growth Stages</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="stage" />
                <YAxis label={{ value: 'Days', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Watering Frequency</h3>
          <p className="text-3xl font-bold text-green-600">{wateringFrequency}</p>
          <p className="text-sm text-gray-500">times watered</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Current Stage</h3>
          <p className="text-3xl font-bold text-green-600">
            {entries[0]?.growth_stage || 'Not Started'}
          </p>
          <p className="text-sm text-gray-500">days in current stage</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Entries</h3>
          <p className="text-3xl font-bold text-green-600">{entries.length}</p>
          <p className="text-sm text-gray-500">journal entries</p>
        </Card>
      </div>
    </div>
  );
} 