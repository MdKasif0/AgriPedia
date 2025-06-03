import React, { useState, useEffect } from 'react';
import { ReminderSettings as ReminderSettingsType, TaskType } from '@/types/calendar';
import { updateReminderSettings } from '@/services/calendarService';
import { motion } from 'framer-motion';
import { FiBell, FiClock, FiMail, FiSmartphone } from 'react-icons/fi';

const taskTypes: TaskType[] = ['water', 'fertilize', 'harvest', 'prune', 'check', 'other'];
const reminderTimes = ['morning', 'afternoon', 'evening', 'custom'];
const reminderTones = ['friendly', 'strict', 'scientific'];

export default function ReminderSettings() {
  const [settings, setSettings] = useState<ReminderSettingsType>({
    reminderTime: 'morning',
    tone: 'friendly',
    enabled: true,
    pushNotifications: true,
    emailNotifications: false,
    disabledTasks: [],
    customTime: '09:00',
  });

  const handleSettingChange = (key: keyof ReminderSettingsType, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateReminderSettings(newSettings);
  };

  const toggleTaskType = (taskType: TaskType) => {
    const newDisabledTasks = settings.disabledTasks.includes(taskType)
      ? settings.disabledTasks.filter(t => t !== taskType)
      : [...settings.disabledTasks, taskType];
    handleSettingChange('disabledTasks', newDisabledTasks);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4">Reminder Settings</h2>

      <div className="space-y-6">
        {/* Enable/Disable Reminders */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiBell className="text-gray-600" />
            <span className="font-medium">Enable Reminders</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => handleSettingChange('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Reminder Time */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FiClock className="text-gray-600" />
            <span className="font-medium">Reminder Time</span>
          </div>
          <select
            value={settings.reminderTime}
            onChange={(e) => handleSettingChange('reminderTime', e.target.value)}
            className="w-full p-2 border rounded"
            disabled={!settings.enabled}
          >
            {reminderTimes.map(time => (
              <option key={time} value={time}>
                {time.charAt(0).toUpperCase() + time.slice(1)}
              </option>
            ))}
          </select>
          {settings.reminderTime === 'custom' && (
            <input
              type="time"
              value={settings.customTime}
              onChange={(e) => handleSettingChange('customTime', e.target.value)}
              className="w-full p-2 border rounded mt-2"
              disabled={!settings.enabled}
            />
          )}
        </div>

        {/* Reminder Tone */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FiBell className="text-gray-600" />
            <span className="font-medium">Reminder Tone</span>
          </div>
          <select
            value={settings.tone}
            onChange={(e) => handleSettingChange('tone', e.target.value)}
            className="w-full p-2 border rounded"
            disabled={!settings.enabled}
          >
            {reminderTones.map(tone => (
              <option key={tone} value={tone}>
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Notification Methods */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <FiSmartphone className="text-gray-600" />
            <span className="font-medium">Push Notifications</span>
            <label className="relative inline-flex items-center cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                className="sr-only peer"
                disabled={!settings.enabled}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <FiMail className="text-gray-600" />
            <span className="font-medium">Email Notifications</span>
            <label className="relative inline-flex items-center cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
                disabled={!settings.enabled}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Disabled Task Types */}
        <div className="space-y-2">
          <span className="font-medium">Disabled Task Types</span>
          <div className="grid grid-cols-2 gap-2">
            {taskTypes.map(taskType => (
              <label
                key={taskType}
                className="flex items-center gap-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={!settings.disabledTasks.includes(taskType)}
                  onChange={() => toggleTaskType(taskType)}
                  className="form-checkbox"
                  disabled={!settings.enabled}
                />
                <span className="capitalize">{taskType}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
} 