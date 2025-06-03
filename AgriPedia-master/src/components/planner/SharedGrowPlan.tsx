import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';
import { GrowPlan } from '@/services/planService';
import { format } from 'date-fns';

interface SharedGrowPlanProps {
  plan: GrowPlan;
}

export default function SharedGrowPlan({ plan }: SharedGrowPlanProps) {
  const handleDownload = async () => {
    try {
      const blob = await exportGrowPlanToPDF(plan);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plan.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading plan:', error);
    }
  };

  const handleShare = () => {
    const link = generateShareableLink(plan);
    navigator.clipboard.writeText(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Created {format(new Date(plan.createdAt), 'MMMM d, yyyy')}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">{plan.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Location</h3>
                <p className="text-muted-foreground">{plan.location}</p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Season</h3>
                <p className="text-muted-foreground">{plan.season}</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Plants</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plan.plants.map((plant, i) => (
                  <Card key={i} className="p-4">
                    <h4 className="font-medium">{plant}</h4>
                  </Card>
                ))}
              </div>
            </div>

            {plan.notes && (
              <div>
                <h3 className="font-medium mb-2">Growing Tips</h3>
                <div className="bg-muted p-4 rounded-lg">
                  {plan.notes.split('\n').map((note, i) => (
                    <p key={i} className="text-sm text-muted-foreground mb-2 last:mb-0">
                      {note}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 