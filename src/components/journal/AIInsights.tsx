'use client';

import { JournalEntry, AIInsight } from '@/types/journal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface AIInsightsProps {
  entries: JournalEntry[];
}

export function AIInsights({ entries }: AIInsightsProps) {
  // This would typically come from an AI service
  const insights: AIInsight = {
    summary: "Your plant is showing strong growth patterns with consistent watering and good sunlight exposure. The leaves are vibrant and healthy.",
    growth_rate: "ahead",
    health_assessment: "Excellent",
    suggestions: [
      "Consider increasing fertilizer frequency during the flowering stage",
      "Monitor for any signs of pest activity as the plant grows larger",
      "Maintain current watering schedule as it's working well"
    ]
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex-grow">
            <h3 className="text-lg font-semibold mb-2">Weekly Summary</h3>
            <p className="text-gray-700">{insights.summary}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {insights.growth_rate === 'ahead' ? (
              <TrendingUp className="w-6 h-6 text-green-600" />
            ) : insights.growth_rate === 'behind' ? (
              <TrendingDown className="w-6 h-6 text-yellow-600" />
            ) : (
              <TrendingUp className="w-6 h-6 text-blue-600" />
            )}
            <h3 className="text-lg font-semibold">Growth Rate</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {insights.growth_rate === 'ahead' ? 'Ahead of Schedule' :
             insights.growth_rate === 'behind' ? 'Behind Schedule' :
             'On Track'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Compared to typical growth patterns
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold">Health Assessment</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {insights.health_assessment}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Based on visual indicators and growth patterns
          </p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">AI Suggestions</h3>
        <div className="space-y-4">
          {insights.suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-green-50"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-sm font-medium text-green-600">
                  {index + 1}
                </span>
              </div>
              <p className="text-gray-700">{suggestion}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline">
          Generate New Insights
        </Button>
      </div>
    </div>
  );
} 