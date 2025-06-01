'use client';

import React, { useState, useEffect } from 'react';
import { saveNotificationPreferences, getNotificationPreferences, NotificationPrefs } from '@/lib/userDataStore'; // Assuming these will be added
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast'; // For feedback on save

const NotificationPreferences: React.FC = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPrefs>({
    frequency: 'all',
    tone: 'motivational',
    enableInApp: true,
    // enablePush: false, // For future use
  });

  useEffect(() => {
    const savedPrefs = getNotificationPreferences();
    if (savedPrefs) {
      setPreferences(savedPrefs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    saveNotificationPreferences(preferences);
    toast({ title: 'Success', description: 'Notification preferences saved!' });
  };

  const handleChange = (field: keyof NotificationPrefs, value: any) => {
    setPreferences(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Manage how and when you receive notifications from AgriPedia.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="in-app-toggle">Enable In-App Notifications</Label>
          {/* Assuming Switch component exists from ShadCN/ui */}
          {/* For now, a checkbox or just rely on frequency 'off' */}
           <div className="flex items-center space-x-2">
               <input
                   type="checkbox"
                   id="in-app-toggle"
                   checked={preferences.enableInApp}
                   onChange={(e) => handleChange('enableInApp', e.target.checked)}
                   className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
               />
               <Label htmlFor="in-app-toggle" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                   Receive notifications within the app
               </Label>
           </div>
        </div>

        <fieldset className="space-y-2" disabled={!preferences.enableInApp}>
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</legend>
          <RadioGroup
            value={preferences.frequency}
            onValueChange={(value) => handleChange('frequency', value)}
            className="gap-2"
          >
            <div><RadioGroupItem value="all" id="freq-all" /><Label htmlFor="freq-all" className="ml-2 font-normal text-gray-700 dark:text-gray-300">All (Stage changes, reminders, tips)</Label></div>
            <div><RadioGroupItem value="key_stages" id="freq-key" /><Label htmlFor="freq-key" className="ml-2 font-normal text-gray-700 dark:text-gray-300">Key Stages Only (e.g., Planting, Harvesting)</Label></div>
            <div><RadioGroupItem value="minimal" id="freq-minimal" /><Label htmlFor="freq-minimal" className="ml-2 font-normal text-gray-700 dark:text-gray-300">Minimal (Critical alerts only)</Label></div>
            <div><RadioGroupItem value="off" id="freq-off" /><Label htmlFor="freq-off" className="ml-2 font-normal text-gray-700 dark:text-gray-300">Off (No in-app notifications)</Label></div>
          </RadioGroup>
        </fieldset>

        <fieldset className="space-y-2" disabled={!preferences.enableInApp || preferences.frequency === 'off'}>
          <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">Tone</legend>
          <RadioGroup
            value={preferences.tone}
            onValueChange={(value) => handleChange('tone', value)}
            className="gap-2"
          >
            <div><RadioGroupItem value="motivational" id="tone-motiv" /><Label htmlFor="tone-motiv" className="ml-2 font-normal text-gray-700 dark:text-gray-300">Motivational & Friendly  🌿</Label></div>
            <div><RadioGroupItem value="minimal_info" id="tone-minimal" /><Label htmlFor="tone-minimal" className="ml-2 font-normal text-gray-700 dark:text-gray-300">Minimal & Informative 📋</Label></div>
            <div><RadioGroupItem value="scientific" id="tone-sci" /><Label htmlFor="tone-sci" className="ml-2 font-normal text-gray-700 dark:text-gray-300">Scientific & Detailed 🔬</Label></div>
          </RadioGroup>
        </fieldset>

        {/* Placeholder for Push Notification settings - Step 4 Part 2 or later */}
        {/* ... */}

        <Button onClick={handleSave} className="w-full sm:w-auto">Save Preferences</Button>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences;
