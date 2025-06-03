import { Plant } from '@/types/plant';

export interface GrowPlan {
  id: string;
  name: string;
  description: string;
  plants: Plant[];
  createdAt: string;
  updatedAt: string;
  season: string;
  location: string;
  notes: string;
}

export function saveGrowPlan(plan: Omit<GrowPlan, 'id' | 'createdAt' | 'updatedAt'>): GrowPlan {
  const savedPlans = getGrowPlans();
  const newPlan: GrowPlan = {
    ...plan,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  savedPlans.push(newPlan);
  localStorage.setItem('growPlans', JSON.stringify(savedPlans));
  return newPlan;
}

export function getGrowPlans(): GrowPlan[] {
  const plans = localStorage.getItem('growPlans');
  return plans ? JSON.parse(plans) : [];
}

export function getGrowPlan(id: string): GrowPlan | null {
  const plans = getGrowPlans();
  return plans.find(plan => plan.id === id) || null;
}

export function updateGrowPlan(id: string, updates: Partial<GrowPlan>): GrowPlan {
  const plans = getGrowPlans();
  const index = plans.findIndex(plan => plan.id === id);
  
  if (index === -1) {
    throw new Error('Plan not found');
  }

  const updatedPlan = {
    ...plans[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  plans[index] = updatedPlan;
  localStorage.setItem('growPlans', JSON.stringify(plans));
  return updatedPlan;
}

export function deleteGrowPlan(id: string): void {
  const plans = getGrowPlans();
  const filteredPlans = plans.filter(plan => plan.id !== id);
  localStorage.setItem('growPlans', JSON.stringify(filteredPlans));
}

export function duplicateGrowPlan(id: string): GrowPlan {
  const plan = getGrowPlan(id);
  if (!plan) {
    throw new Error('Plan not found');
  }

  const { id: _, createdAt, updatedAt, ...planData } = plan;
  return saveGrowPlan({
    ...planData,
    name: `${planData.name} (Copy)`,
  });
}

export async function exportGrowPlanToPDF(plan: GrowPlan): Promise<Blob> {
  // Implementation for PDF export
  // This is a placeholder - you'll need to implement actual PDF generation
  throw new Error('PDF export not implemented');
}

export function generateShareableLink(plan: GrowPlan): string {
  const planData = btoa(JSON.stringify(plan));
  return `${window.location.origin}/share/${planData}`;
} 