'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalEntry, GrowthStage, UserMood, PlantMood } from '@/types/journal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Camera, Image, Smile, Cloud, CheckSquare, Share2, Download } from 'lucide-react';
import { JournalTimeline } from './JournalTimeline';
import { GrowthAnalytics } from './GrowthAnalytics';
import { AIInsights } from './AIInsights';

interface PlantJournalProps {
  plantId: string;
  plantName: string;
  initialEntries?: JournalEntry[];
}

export function PlantJournal({ plantId, plantName, initialEntries = [] }: PlantJournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>(initialEntries);
  const [view, setView] = useState<'timeline' | 'gallery'>('timeline');
  const [isCreatingEntry, setIsCreatingEntry] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleCreateEntry = async (entry: Omit<JournalEntry, 'entry_id' | 'user_id' | 'plant_id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      entry_id: `log_${Date.now()}`,
      user_id: 'current_user', // Replace with actual user ID
      plant_id: plantId,
    };

    setEntries(prev => [newEntry, ...prev]);
    setIsCreatingEntry(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{plantName}'s Growth Journal</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setView(view === 'timeline' ? 'gallery' : 'timeline')}
          >
            {view === 'timeline' ? 'Gallery View' : 'Timeline View'}
          </Button>
          <Button onClick={() => setIsCreatingEntry(true)}>
            New Entry
          </Button>
        </div>
      </div>

      <Tabs defaultValue="journal" className="w-full">
        <TabsList>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="journal">
          <AnimatePresence mode="wait">
            {isCreatingEntry ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <NewEntryForm
                  onSubmit={handleCreateEntry}
                  onCancel={() => setIsCreatingEntry(false)}
                  selectedDate={selectedDate}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <JournalTimeline entries={entries} view={view} />
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="analytics">
          <GrowthAnalytics entries={entries} />
        </TabsContent>

        <TabsContent value="insights">
          <AIInsights entries={entries} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface NewEntryFormProps {
  onSubmit: (entry: Omit<JournalEntry, 'entry_id' | 'user_id' | 'plant_id'>) => void;
  onCancel: () => void;
  selectedDate: Date;
}

function NewEntryForm({ onSubmit, onCancel, selectedDate }: NewEntryFormProps) {
  const [note, setNote] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [tasks, setTasks] = useState<string[]>([]);
  const [userMood, setUserMood] = useState<UserMood>('Happy');
  const [plantMood, setPlantMood] = useState<PlantMood>('Growing');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date: format(selectedDate, 'yyyy-MM-dd'),
      growth_stage: 'Vegetative', // Auto-detect based on plant age
      note,
      photos,
      weather_info: {
        temperature: '25°C', // Auto-detect from location
        humidity: '60%',
        condition: 'Sunny'
      },
      task_summary: tasks,
      user_mood: userMood,
      plant_mood: plantMood,
      health_status: 'Healthy'
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
            />
          </div>
          <div className="space-y-4">
            <div>
              <Label>Your Mood</Label>
              <div className="flex gap-2 mt-2">
                {['Excited', 'Happy', 'Hopeful', 'Concerned', 'Frustrated'].map((mood) => (
                  <Button
                    key={mood}
                    type="button"
                    variant={userMood === mood ? 'default' : 'outline'}
                    onClick={() => setUserMood(mood as UserMood)}
                  >
                    {mood}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <Label>Plant's Mood</Label>
              <div className="flex gap-2 mt-2">
                {['Thriving', 'Growing', 'Struggling', 'Wilting', 'Recovering'].map((mood) => (
                  <Button
                    key={mood}
                    type="button"
                    variant={plantMood === mood ? 'default' : 'outline'}
                    onClick={() => setPlantMood(mood as PlantMood)}
                  >
                    {mood}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <Label>Photos</Label>
          <div className="flex gap-2 mt-2">
            <Button type="button" variant="outline">
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            <Button type="button" variant="outline">
              <Image className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        <div>
          <Label>Notes</Label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How's your plant doing today?"
            className="mt-2"
          />
        </div>

        <div>
          <Label>Tasks Completed</Label>
          <div className="flex gap-2 mt-2">
            {['Watered', 'Fertilized', 'Pruned', 'Checked for pests'].map((task) => (
              <Button
                key={task}
                type="button"
                variant={tasks.includes(task) ? 'default' : 'outline'}
                onClick={() => setTasks(prev => 
                  prev.includes(task)
                    ? prev.filter(t => t !== task)
                    : [...prev, task]
                )}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                {task}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            Save Entry
          </Button>
        </div>
      </form>
    </Card>
  );
} 