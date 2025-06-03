import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Share2, FileDown, Edit2, Copy, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface GrowPlan {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  data: {
    plants: Array<{
      id: string;
      commonName: string;
      scientificName: string;
      plantId: string; // Reference to growing guide
    }>;
  };
}

export default function GrowPlanManager() {
  const [plans, setPlans] = useState<GrowPlan[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<GrowPlan | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved plans from localStorage
    const savedPlans = JSON.parse(localStorage.getItem('growPlans') || '[]');
    setPlans(savedPlans);
  }, []);

  const savePlan = (plan: GrowPlan) => {
    const updatedPlans = editingPlan
      ? plans.map(p => (p.id === editingPlan.id ? plan : p))
      : [...plans, plan];
    
    setPlans(updatedPlans);
    localStorage.setItem('growPlans', JSON.stringify(updatedPlans));
    setIsDialogOpen(false);
    setEditingPlan(null);
    
    toast({
      title: 'Success',
      description: `Plan ${editingPlan ? 'updated' : 'saved'} successfully!`,
    });
  };

  const duplicatePlan = (plan: GrowPlan) => {
    const newPlan = {
      ...plan,
      id: Date.now().toString(),
      name: `${plan.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    setPlans([...plans, newPlan]);
    localStorage.setItem('growPlans', JSON.stringify([...plans, newPlan]));
    
    toast({
      title: 'Success',
      description: 'Plan duplicated successfully!',
    });
  };

  const deletePlan = (planId: string) => {
    const updatedPlans = plans.filter(p => p.id !== planId);
    setPlans(updatedPlans);
    localStorage.setItem('growPlans', JSON.stringify(updatedPlans));
    
    toast({
      title: 'Success',
      description: 'Plan deleted successfully!',
    });
  };

  const exportPlan = async (plan: GrowPlan) => {
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

  const sharePlan = async (plan: GrowPlan) => {
    try {
      // Generate a shareable link
      const shareableData = btoa(JSON.stringify(plan));
      const shareableLink = `${window.location.origin}/share-plan/${shareableData}`;
      
      // Copy to clipboard
      await navigator.clipboard.writeText(shareableLink);
      
      toast({
        title: 'Success',
        description: 'Shareable link copied to clipboard!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate shareable link. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Grow Plans</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Plan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </DialogTitle>
            </DialogHeader>
            <PlanForm
              plan={editingPlan}
              onSave={savePlan}
              onCancel={() => {
                setIsDialogOpen(false);
                setEditingPlan(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{plan.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingPlan(plan);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => duplicatePlan(plan)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deletePlan(plan.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  
                  {/* Plant List with Growing Guide Links */}
                  {plan.data.plants && plan.data.plants.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold mb-2">Plants</h3>
                      <div className="space-y-2">
                        {plan.data.plants.map((plant) => (
                          <div
                            key={plant.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted"
                          >
                            <div>
                              <p className="font-medium">{plant.commonName}</p>
                              <p className="text-xs text-muted-foreground">
                                {plant.scientificName}
                              </p>
                            </div>
                            <Link href={`/grow-plan/guide/${plant.plantId}`}>
                              <Button variant="ghost" size="sm">
                                View Guide
                              </Button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => exportPlan(plan)}
                    >
                      <FileDown className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sharePlan(plan)}
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

interface PlanFormProps {
  plan: GrowPlan | null;
  onSave: (plan: GrowPlan) => void;
  onCancel: () => void;
}

function PlanForm({ plan, onSave, onCancel }: PlanFormProps) {
  const [name, setName] = useState(plan?.name || '');
  const [description, setDescription] = useState(plan?.description || '');
  const [plants, setPlants] = useState(plan?.data?.plants || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: plan?.id || Date.now().toString(),
      name,
      description,
      createdAt: plan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: {
        plants,
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Plan Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter plan name"
          required
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter plan description"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {plan ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
} 