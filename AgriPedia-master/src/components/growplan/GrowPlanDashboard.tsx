import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { useGrowPlan } from '@/hooks/useGrowPlan';
import { motion } from 'framer-motion';
import { Calendar, ListTodo, Plant } from 'lucide-react';
import { format } from 'date-fns';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function GrowPlanDashboard() {
  const { growPlan, updateTaskStatus, getUpcomingTasks } = useGrowPlan();
  const upcomingTasks = getUpcomingTasks();

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* My Plants Section */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Plant className="w-5 h-5 text-primary" />
                <CardTitle>My Plants</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {growPlan.map(plant => (
                  <div key={plant.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden">
                      <img
                        src={plant.imageUrl}
                        alt={plant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{plant.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Added {format(new Date(plant.addedDate), 'MMM d, yyyy')}
                      </p>
                      <Progress value={plant.progress} className="mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Tasks Section */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-primary" />
                <CardTitle>Upcoming Tasks</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={(checked) => 
                        updateTaskStatus(task.plantId, task.id, checked as boolean)
                      }
                    />
                    <div>
                      <p className="text-sm font-medium">{task.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(task.dueDate), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calendar View */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <CardTitle>Calendar View</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium">
                    {day}
                  </div>
                ))}
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date();
                  date.setDate(date.getDate() - date.getDay() + i);
                  const tasksForDay = upcomingTasks.filter(task => 
                    format(new Date(task.dueDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                  );
                  
                  return (
                    <div
                      key={i}
                      className={`p-2 min-h-[80px] border rounded-lg ${
                        format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                          ? 'bg-primary/10'
                          : ''
                      }`}
                    >
                      <div className="text-sm text-muted-foreground">
                        {format(date, 'd')}
                      </div>
                      {tasksForDay.map(task => (
                        <div
                          key={task.id}
                          className="mt-1 text-xs p-1 rounded bg-primary/10 text-primary truncate"
                        >
                          {task.description}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
} 