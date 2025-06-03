export const USER_MODES = [
  { id: 'general', label: 'General Use' }, // Default mode
  { id: 'gardener', label: 'Gardener Mode' },
  { id: 'farmer', label: 'Farmer Mode' },
  { id: 'educational', label: 'Educational Mode' },
] as const;

export type UserModeId = typeof USER_MODES[number]['id'];

export const DEFAULT_USER_MODE_ID: UserModeId = 'general';
