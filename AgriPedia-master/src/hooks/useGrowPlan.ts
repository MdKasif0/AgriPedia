import { useState, useEffect } from 'react';
import { Plant } from '@/types/plant';

interface GrowPlanPlant extends Plant {
  addedDate: string;
  tasks: GrowPlanTask[];
  progress: number;
}

interface GrowPlanTask {
  id: string;
  type: 'water' | 'fertilize' | 'prune' | 'harvest';
  dueDate: string;
  completed: boolean;
  description: string;
}

export function useGrowPlan() {
  const [growPlan, setGrowPlan] = useState<GrowPlanPlant[]>([]);

  useEffect(() => {
    // Load grow plan from localStorage
    const savedPlan = localStorage.getItem('growPlan');
    if (savedPlan) {
      setGrowPlan(JSON.parse(savedPlan));
    }
  }, []);

  useEffect(() => {
    // Save grow plan to localStorage whenever it changes
    localStorage.setItem('growPlan', JSON.stringify(growPlan));
  }, [growPlan]);

  const addToGrowPlan = (plant: Plant) => {
    if (!isInGrowPlan(plant.id)) {
      const newPlant: GrowPlanPlant = {
        ...plant,
        addedDate: new Date().toISOString(),
        tasks: generateInitialTasks(plant),
        progress: 0
      };
      setGrowPlan(prev => [...prev, newPlant]);
    }
  };

  const removeFromGrowPlan = (plantId: string) => {
    setGrowPlan(prev => prev.filter(p => p.id !== plantId));
  };

  const isInGrowPlan = (plantId: string) => {
    return growPlan.some(p => p.id === plantId);
  };

  const updateTaskStatus = (plantId: string, taskId: string, completed: boolean) => {
    setGrowPlan(prev => prev.map(plant => {
      if (plant.id === plantId) {
        const updatedTasks = plant.tasks.map(task => 
          task.id === taskId ? { ...task, completed } : task
        );
        const progress = calculateProgress(updatedTasks);
        return { ...plant, tasks: updatedTasks, progress };
      }
      return plant;
    }));
  };

  const getUpcomingTasks = () => {
    const now = new Date();
    return growPlan.flatMap(plant => 
      plant.tasks
        .filter(task => !task.completed && new Date(task.dueDate) > now)
        .map(task => ({
          ...task,
          plantName: plant.name,
          plantId: plant.id
        }))
    ).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  return {
    growPlan,
    addToGrowPlan,
    removeFromGrowPlan,
    isInGrowPlan,
    updateTaskStatus,
    getUpcomingTasks
  };
}

function generateInitialTasks(plant: Plant): GrowPlanTask[] {
  const tasks: GrowPlanTask[] = [];
  const now = new Date();

  // Add watering tasks
  for (let i = 0; i < plant.harvestTime.min; i += 7) {
    tasks.push({
      id: `water-${plant.id}-${i}`,
      type: 'water',
      dueDate: new Date(now.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      description: `Water ${plant.name}`
    });
  }

  // Add fertilizing tasks
  for (let i = 14; i < plant.harvestTime.min; i += 30) {
    tasks.push({
      id: `fertilize-${plant.id}-${i}`,
      type: 'fertilize',
      dueDate: new Date(now.getTime() + i * 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      description: `Fertilize ${plant.name}`
    });
  }

  // Add harvest task
  tasks.push({
    id: `harvest-${plant.id}`,
    type: 'harvest',
    dueDate: new Date(now.getTime() + plant.harvestTime.min * 24 * 60 * 60 * 1000).toISOString(),
    completed: false,
    description: `Harvest ${plant.name}`
  });

  return tasks;
}

function calculateProgress(tasks: GrowPlanTask[]): number {
  if (tasks.length === 0) return 0;
  const completed = tasks.filter(task => task.completed).length;
  return Math.round((completed / tasks.length) * 100);
} 