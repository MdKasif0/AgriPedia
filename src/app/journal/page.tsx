'use client';

import { PlantJournal } from '@/components/journal/PlantJournal';

export default function JournalPage() {
  // This would typically come from your database
  const mockEntries = [
    {
      entry_id: 'log_001',
      user_id: 'u123',
      plant_id: 'basil_001',
      date: '2024-03-15',
      growth_stage: 'Vegetative',
      note: 'Plant is growing well! New leaves are vibrant and healthy.',
      photos: ['/images/plants/basil_day7.jpg'],
      weather_info: {
        temperature: '25°C',
        humidity: '60%',
        condition: 'Sunny'
      },
      task_summary: ['Watered', 'Checked for pests'],
      user_mood: 'Happy',
      plant_mood: 'Thriving',
      health_status: 'Healthy',
      height: 15
    },
    {
      entry_id: 'log_002',
      user_id: 'u123',
      plant_id: 'basil_001',
      date: '2024-03-14',
      growth_stage: 'Vegetative',
      note: 'First signs of new growth after transplanting.',
      photos: ['/images/plants/basil_day6.jpg'],
      weather_info: {
        temperature: '24°C',
        humidity: '65%',
        condition: 'Partly Cloudy'
      },
      task_summary: ['Watered', 'Fertilized'],
      user_mood: 'Excited',
      plant_mood: 'Growing',
      health_status: 'Healthy',
      height: 12
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <PlantJournal
        plantId="basil_001"
        plantName="Sweet Basil"
        initialEntries={mockEntries}
      />
    </div>
  );
} 