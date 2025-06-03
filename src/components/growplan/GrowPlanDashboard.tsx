import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Plant } from '@/types/plant';
import { Calendar, CheckCircle2, Clock, Droplets, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GrowPlanDashboardProps {
  savedPlants: Plant[];
}

interface Task {
  id: string;
  plantId: string;
  type: 'water' | 'fertilize' | 'prune' | 'harvest';
  dueDate: Date;
  completed: boolean;
}

export default function GrowPlanDashboard({ savedPlants }: GrowPlanDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Generate tasks based on saved plants
  useEffect(() => {
    const newTasks: Task[] = [];
    savedPlants.forEach(plant => {
      // Add watering tasks
      newTasks.push({
        id: `${plant.id}-water-${Date.now()}`,
        plantId: plant.id,
        type: 'water',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        completed: false,
      });

      // Add fertilizing tasks
      newTasks.push({
        id: `${plant.id}-fertilize-${Date.now()}`,
        plantId: plant.id,
        type: 'fertilize',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        completed: false,
      });
    });
    setTasks(newTasks);
  }, [savedPlants]);

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const getPlantProgress = (plant: Plant) => {
    // This would be calculated based on planting date and growth duration
    return Math.floor(Math.random() * 100);
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPlants.map((plant) => (
              <motion.div
                key={plant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {plant.image && (
                        <img
                          src={plant.image}
                          alt={plant.commonName}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <div>
                        <CardTitle className="text-lg">{plant.commonName}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {plant.scientificName}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Growth Progress</span>
                          <span>{getPlantProgress(plant)}%</span>
                        </div>
                        <Progress value={getPlantProgress(plant)} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-yellow-500" />
                          <span>{plant.climaticRequirements?.temperature.split('.')[0]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-blue-500" />
                          <span>{plant.irrigationAndWaterNeeds?.split('.')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="grid gap-4">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className={task.completed ? 'opacity-50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleTaskCompletion(task.id)}
                        >
                          <CheckCircle2
                            className={`w-5 h-5 ${
                              task.completed ? 'text-green-500' : 'text-gray-400'
                            }`}
                          />
                        </Button>
                        <div>
                          <p className="font-medium">
                            {task.type.charAt(0).toUpperCase() + task.type.slice(1)}{' '}
                            {savedPlants.find(p => p.id === task.plantId)?.commonName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Due: {task.dueDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(task.dueDate).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks
                  .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-accent"
                    >
                      <div className="flex items-center gap-4">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {task.type.charAt(0).toUpperCase() + task.type.slice(1)}{' '}
                            {savedPlants.find(p => p.id === task.plantId)?.commonName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {task.dueDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleTaskCompletion(task.id)}
                      >
                        {task.completed ? 'Completed' : 'Mark Complete'}
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 