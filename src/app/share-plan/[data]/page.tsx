import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SharedPlanPageProps {
  params: {
    data: string;
  };
}

export default function SharedPlanPage({ params }: SharedPlanPageProps) {
  const { toast } = useToast();
  const plan = JSON.parse(atob(params.data));

  const exportPlan = async () => {
    try {
      // Create a PDF using jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Add content to PDF
      doc.text(plan.name, 20, 20);
      doc.text(`Created: ${new Date(plan.createdAt).toLocaleDateString()}`, 20, 30);
      doc.text(`Updated: ${new Date(plan.updatedAt).toLocaleDateString()}`, 20, 40);
      doc.text('Plant List:', 20, 60);
      
      // Add plant data
      let y = 70;
      plan.data.plants?.forEach((plant: any) => {
        doc.text(`- ${plant.commonName}`, 30, y);
        y += 10;
      });
      
      // Save the PDF
      doc.save(`${plan.name.toLowerCase().replace(/\s+/g, '-')}.pdf`);
      
      toast({
        title: 'Success',
        description: 'Plan exported as PDF successfully!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export plan. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{plan.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={exportPlan}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {plan.description}
            </p>
            <div className="space-y-4">
              <h3 className="font-semibold">Plants</h3>
              <ul className="space-y-2">
                {plan.data.plants?.map((plant: any) => (
                  <li key={plant.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full" />
                    <span>{plant.commonName}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 