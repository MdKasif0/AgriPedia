'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScanResult, HealthStatus } from '@/types/health-detector';
import { Badge } from '@/components/ui/badge';

interface ScanResultCardProps {
  result: ScanResult;
  onFeedback: (scanId: string, isCorrect: boolean, suggestedIssue?: string) => void;
}

const statusConfig: Record<HealthStatus, {
  icon: typeof CheckCircle;
  color: string;
  bgColor: string;
}> = {
  healthy: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  urgent: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  }
};

export function ScanResultCard({ result, onFeedback }: ScanResultCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const StatusIcon = statusConfig[result.detection.status].icon;
  const statusColor = statusConfig[result.detection.status].color;
  const statusBgColor = statusConfig[result.detection.status].bgColor;

  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-4">
        <div className="relative aspect-video rounded-lg overflow-hidden">
          <img
            src={result.imageUrl}
            alt="Scanned plant"
            className="w-full h-full object-cover"
          />
          {result.detection.affectedAreas.map((area, index) => (
            <div
              key={index}
              className="absolute border-2 border-red-500"
              style={{
                left: `${area.x}px`,
                top: `${area.y}px`,
                width: `${area.width}px`,
                height: `${area.height}px`
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className={`w-5 h-5 ${statusColor}`} />
            <span className="font-medium">{result.detection.status}</span>
          </div>
          <Badge variant="outline">
            {Math.round(result.detection.confidence * 100)}% confidence
          </Badge>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Diagnosis</h3>
          <p className="text-gray-600">{result.detection.description}</p>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">Recommended Actions</h3>
          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Immediate</h4>
              <ul className="list-disc list-inside text-gray-600">
                {result.detection.recommendations.immediate.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">Preventive</h4>
              <ul className="list-disc list-inside text-gray-600">
                {result.detection.recommendations.preventive.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {result.detection.relatedArticles && (
          <div className="space-y-2">
            <h3 className="font-medium">Learn More</h3>
            <div className="flex flex-wrap gap-2">
              {result.detection.relatedArticles.map((article, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-200"
                >
                  {article}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {!showFeedback && !result.userFeedback && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowFeedback(true)}
            >
              Provide Feedback
            </Button>
          </div>
        )}

        {showFeedback && !result.userFeedback && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="pt-4 border-t space-y-4"
          >
            <p className="text-sm text-gray-600">Was this diagnosis correct?</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onFeedback(result.id, true);
                  setShowFeedback(false);
                }}
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Yes
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  onFeedback(result.id, false);
                  setShowFeedback(false);
                }}
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                No
              </Button>
            </div>
          </motion.div>
        )}

        {result.userFeedback && (
          <div className="pt-4 border-t">
            <p className="text-sm text-gray-600">
              Thank you for your feedback!
              {!result.userFeedback.isCorrect && result.userFeedback.suggestedIssue && (
                <span> We'll review the suggested issue: {result.userFeedback.suggestedIssue}</span>
              )}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 