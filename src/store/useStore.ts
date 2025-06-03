import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  lastUpdated: Date;
}

interface GrowthRecord {
  date: Date;
  height: number;
  leafCount: number;
  notes: string;
  imageUrl?: string;
}

interface Plant {
  id: string;
  name: string;
  species: string;
  health: 'healthy' | 'warning' | 'critical';
  lastWatered: Date;
  nextWatering: Date;
  growthStage: string;
  imageUrl: string;
  notes: string[];
  growthRecords: GrowthRecord[];
  weatherData?: WeatherData;
  identification?: {
    confidence: number;
    species: string;
    commonNames: string[];
    careInstructions: string[];
  };
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'weather' | 'growth';
  read: boolean;
  timestamp: Date;
}

interface UserState {
  plants: Plant[];
  isAuthenticated: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    preferences: {
      notifications: boolean;
      darkMode: boolean;
      measurementUnit: 'metric' | 'imperial';
    };
  } | null;
  notifications: Notification[];
  addPlant: (plant: Plant) => void;
  updatePlant: (id: string, plant: Partial<Plant>) => void;
  deletePlant: (id: string) => void;
  addGrowthRecord: (plantId: string, record: GrowthRecord) => void;
  updateWeatherData: (plantId: string, weather: WeatherData) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  setUser: (user: UserState['user']) => void;
  updateUserPreferences: (preferences: Partial<UserState['user']['preferences']>) => void;
  logout: () => void;
}

export const useStore = create<UserState>()(
  persist(
    (set) => ({
      plants: [],
      isAuthenticated: false,
      user: null,
      notifications: [],
      addPlant: (plant) => set((state) => ({ plants: [...state.plants, plant] })),
      updatePlant: (id, plant) =>
        set((state) => ({
          plants: state.plants.map((p) => (p.id === id ? { ...p, ...plant } : p)),
        })),
      deletePlant: (id) =>
        set((state) => ({
          plants: state.plants.filter((p) => p.id !== id),
        })),
      addGrowthRecord: (plantId, record) =>
        set((state) => ({
          plants: state.plants.map((p) =>
            p.id === plantId
              ? { ...p, growthRecords: [...p.growthRecords, record] }
              : p
          ),
        })),
      updateWeatherData: (plantId, weather) =>
        set((state) => ({
          plants: state.plants.map((p) =>
            p.id === plantId ? { ...p, weatherData: weather } : p
          ),
        })),
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: Date.now().toString(),
              read: false,
              timestamp: new Date(),
            },
            ...state.notifications,
          ],
        })),
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),
      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),
      updateUserPreferences: (preferences) =>
        set((state) => ({
          user: state.user
            ? { ...state.user, preferences: { ...state.user.preferences, ...preferences } }
            : null,
        })),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'agripedia-storage',
    }
  )
); 