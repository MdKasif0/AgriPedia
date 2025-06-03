import { useStore } from '@/store/useStore';

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }
}

export async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    });
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    throw error;
  }
}

export function scheduleNotification(title: string, options: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, options);
    return notification;
  }
}

export function scheduleWateringReminder(plantId: string, plantName: string, nextWatering: Date) {
  const { addNotification } = useStore.getState();
  
  // Schedule notification
  const timeUntilWatering = nextWatering.getTime() - Date.now();
  if (timeUntilWatering > 0) {
    setTimeout(() => {
      scheduleNotification('Time to Water Your Plant!', {
        body: `It's time to water your ${plantName}`,
        icon: '/icons/watering-can.png',
      });
      
      addNotification({
        title: 'Watering Reminder',
        message: `Time to water your ${plantName}`,
        type: 'watering',
      });
    }, timeUntilWatering);
  }
}

export function scheduleWeatherAlert(plantId: string, plantName: string, weatherData: any) {
  const { addNotification } = useStore.getState();
  
  // Check for extreme weather conditions
  if (weatherData.temperature > 30 || weatherData.temperature < 5) {
    scheduleNotification('Weather Alert for Your Plant', {
      body: `Extreme temperature (${weatherData.temperature}°C) detected for ${plantName}`,
      icon: '/icons/weather-alert.png',
    });
    
    addNotification({
      title: 'Weather Alert',
      message: `Extreme temperature detected for ${plantName}`,
      type: 'weather',
    });
  }
}

export function scheduleGrowthMilestone(plantId: string, plantName: string, milestone: string) {
  const { addNotification } = useStore.getState();
  
  scheduleNotification('Growth Milestone Reached!', {
    body: `Your ${plantName} has reached a new milestone: ${milestone}`,
    icon: '/icons/growth.png',
  });
  
  addNotification({
    title: 'Growth Milestone',
    message: `Your ${plantName} has reached a new milestone: ${milestone}`,
    type: 'growth',
  });
} 