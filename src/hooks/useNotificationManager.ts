import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
    getNotificationPreferences,
    NotificationPrefs,
    getShownNotifications,
    markNotificationAsShown,
    DEFAULT_NOTIFICATION_PREFS, // Import this
    PlantGuideProgress, // Assuming PlantGuideProgress is also exported or available
    getGrowPlanProgress
} from '@/lib/userDataStore';
// getProduceGuide and GrowingGuide are not needed here anymore due to data structure change.

interface NotificationTrigger {
  id: string;
  title: string;
  message: string;
  plantName: string;
  stageName?: string;
  type: 'stage_start' | 'reminder' | 'tip';
}

export function useNotificationManager() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<NotificationPrefs>(DEFAULT_NOTIFICATION_PREFS);

  useEffect(() => {
    setPreferences(getNotificationPreferences());
    const handlePrefsChange = (event: CustomEvent<NotificationPrefs>) => {
      setPreferences(event.detail);
    };
    window.addEventListener('notificationPrefsChanged', handlePrefsChange as EventListener);
    return () => window.removeEventListener('notificationPrefsChanged', handlePrefsChange as EventListener);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !preferences.enableInApp || preferences.frequency === 'off') {
      return;
    }

    const growPlan = getGrowPlanProgress();
    if (!growPlan || growPlan.plants.length === 0) {
      return;
    }

    const shownNotifications = getShownNotifications();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    growPlan.plants.forEach(plantInstance => {
      if (!plantInstance.planterId || !plantInstance.plantCommonName || !plantInstance.guideStagesSummary) return;

      // A. Check for Stage Start notifications
      plantInstance.guideStagesSummary.forEach(stageSummary => {
        const stageStartDateStr = plantInstance.stageStartDates?.[stageSummary.stage];
        if (stageStartDateStr) {
          const stageStartDate = new Date(stageStartDateStr);
          stageStartDate.setHours(0, 0, 0, 0);

          if (stageStartDate.getTime() === today.getTime()) {
            const notifId = `${plantInstance.planterId}_${stageSummary.stage}_stage_start`;
            if (!shownNotifications[notifId]) {
              if (preferences.frequency === 'all' || (preferences.frequency === 'key_stages' && (stageSummary.stage === "Planting" || stageSummary.stage === "Harvesting"))) {
                let message = `Your ${plantInstance.plantCommonName} is ready for the '${stageSummary.stage}' stage!`;
                if (preferences.tone === 'motivational') message += " Time to get those hands dirty! 🌱";
                if (preferences.tone === 'scientific') message += ` Expected duration: ${stageSummary.duration_days} days.`;

                toast({
                  title: `🌱 New Stage: ${stageSummary.stage} for ${plantInstance.plantCommonName}`,
                  description: message,
                  duration: 7000,
                });
                markNotificationAsShown(notifId);
              }
            }
          }
        }
      });

      // B. Watering/Fertilizing Reminders
      if (preferences.frequency === 'all') {
        const growingStageSummary = plantInstance.guideStagesSummary.find(s => s.stage === "Growing");
        // Ensure currentStage is accurately reflecting the plant's actual current stage.
        // This check might be simplified if currentStage is reliably updated elsewhere.
        if (growingStageSummary && plantInstance.stageStartDates?.["Growing"]) {
            const growingStartDate = new Date(plantInstance.stageStartDates["Growing"]);
            growingStartDate.setHours(0,0,0,0);
            const stageEndDate = new Date(plantInstance.stageEndDates?.["Growing"] || Date.now() + 86400000); // Default to tomorrow if no end date
            stageEndDate.setHours(0,0,0,0);

            // Only trigger reminder if today is within the growing stage
            if (today.getTime() >= growingStartDate.getTime() && today.getTime() < stageEndDate.getTime()) {
                const reminderDate = new Date(growingStartDate);
                reminderDate.setDate(growingStartDate.getDate() + 7);
                reminderDate.setHours(0,0,0,0);

                if (reminderDate.getTime() === today.getTime() && growingStageSummary.duration_days > 7) {
                    const notifId = `${plantInstance.planterId}_growing_water_reminder_d7`;
                    if(!shownNotifications[notifId]) {
                        let message = `Remember to check the watering for your ${plantInstance.plantCommonName}. Consistent moisture is key!`;
                        if (preferences.tone === 'motivational') message += " Keep up the great work! 💧";
                        toast({
                            title: `Reminder for ${plantInstance.plantCommonName}`,
                            description: message,
                            duration: 6000,
                        });
                        markNotificationAsShown(notifId);
                    }
                }
            }
        }
      }

      // C. Tips & Encouragement (Halfway through the whole guide)
      if (preferences.frequency === 'all' || preferences.frequency === 'key_stages') {
          const addedDate = new Date(plantInstance.addedDate);
          addedDate.setHours(0,0,0,0);
          const totalDuration = plantInstance.guideStagesSummary.reduce((sum, s) => sum + s.duration_days, 0);
          if (totalDuration > 0) {
              const halfwayDate = new Date(addedDate);
              halfwayDate.setDate(addedDate.getDate() + Math.floor(totalDuration / 2));
              halfwayDate.setHours(0,0,0,0);

              if (halfwayDate.getTime() === today.getTime()) {
                  const notifId = `${plantInstance.planterId}_halfway_encouragement`;
                  if(!shownNotifications[notifId]) {
                      let message = `You're halfway to harvesting your ${plantInstance.plantCommonName}! 🎉`;
                      if (preferences.tone === 'motivational') message += " Amazing progress, green thumb!";
                      toast({
                          title: `Milestone for ${plantInstance.plantCommonName}!`,
                          description: message,
                          duration: 6000,
                      });
                      markNotificationAsShown(notifId);
                  }
              }
          }
      }

    });
  }, [preferences, toast]);
}
