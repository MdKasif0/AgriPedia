import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { GrowingStage } from '@/data/growingGuides';

interface GrowingGuideNotificationsProps {
  plantId: string;
  plantName: string;
  currentStage: GrowingStage;
  stageIndex: number;
  startDate: Date;
  onNotificationPreferenceChange: (preferences: NotificationPreferences) => void;
}

interface NotificationPreferences {
  stageNotifications: boolean;
  reminderNotifications: boolean;
  tipNotifications: boolean;
  notificationTone: 'motivational' | 'minimal' | 'scientific';
}

export default function GrowingGuideNotifications({
  plantId,
  plantName,
  currentStage,
  stageIndex,
  startDate,
  onNotificationPreferenceChange,
}: GrowingGuideNotificationsProps) {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPreferences>(() => {
    const saved = localStorage.getItem(`notification-preferences-${plantId}`);
    return saved
      ? JSON.parse(saved)
      : {
          stageNotifications: true,
          reminderNotifications: true,
          tipNotifications: true,
          notificationTone: 'motivational',
        };
  });

  useEffect(() => {
    // Save preferences to localStorage
    localStorage.setItem(
      `notification-preferences-${plantId}`,
      JSON.stringify(preferences)
    );
    onNotificationPreferenceChange(preferences);
  }, [preferences, plantId, onNotificationPreferenceChange]);

  const getNotificationMessage = (
    type: 'stage' | 'reminder' | 'tip',
    content: string
  ) => {
    const tones = {
      motivational: {
        stage: `🌱 Time to start ${content}! You've got this!`,
        reminder: `💪 Don't forget: ${content}. Keep up the great work!`,
        tip: `✨ Pro tip: ${content}. You're doing amazing!`,
      },
      minimal: {
        stage: `Next stage: ${content}`,
        reminder: `Reminder: ${content}`,
        tip: `Tip: ${content}`,
      },
      scientific: {
        stage: `Stage ${stageIndex + 1}: ${content}. Optimal conditions required.`,
        reminder: `Required action: ${content}. Maintain optimal conditions.`,
        tip: `Scientific observation: ${content}. Consider environmental factors.`,
      },
    };

    return tones[preferences.notificationTone][type];
  };

  const scheduleNotification = (
    type: 'stage' | 'reminder' | 'tip',
    content: string,
    delay: number
  ) => {
    if (!preferences[`${type}Notifications`]) return;

    setTimeout(() => {
      toast({
        title: plantName,
        description: getNotificationMessage(type, content),
        duration: 5000,
      });
    }, delay);
  };

  // Schedule notifications for the current stage
  useEffect(() => {
    // Stage notification
    scheduleNotification('stage', currentStage.stage, 0);

    // Reminder notifications
    currentStage.reminders?.forEach((reminder, index) => {
      const delay = (index + 1) * 24 * 60 * 60 * 1000; // Daily reminders
      scheduleNotification('reminder', reminder, delay);
    });

    // Tip notifications
    currentStage.tips?.forEach((tip, index) => {
      const delay = (index + 1) * 12 * 60 * 60 * 1000; // Twice daily tips
      scheduleNotification('tip', tip, delay);
    });
  }, [currentStage, plantName]);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Notification Settings</h3>
      <div className="space-y-2">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={preferences.stageNotifications}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                stageNotifications: e.target.checked,
              }))
            }
            className="rounded border-gray-300"
          />
          <span>Stage Notifications</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={preferences.reminderNotifications}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                reminderNotifications: e.target.checked,
              }))
            }
            className="rounded border-gray-300"
          />
          <span>Reminder Notifications</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={preferences.tipNotifications}
            onChange={(e) =>
              setPreferences((prev) => ({
                ...prev,
                tipNotifications: e.target.checked,
              }))
            }
            className="rounded border-gray-300"
          />
          <span>Tip Notifications</span>
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium mb-2">
          Notification Tone
        </label>
        <select
          value={preferences.notificationTone}
          onChange={(e) =>
            setPreferences((prev) => ({
              ...prev,
              notificationTone: e.target.value as NotificationPreferences['notificationTone'],
            }))
          }
          className="w-full rounded-md border border-gray-300 p-2"
        >
          <option value="motivational">Motivational</option>
          <option value="minimal">Minimal</option>
          <option value="scientific">Scientific</option>
        </select>
      </div>
    </div>
  );
} 