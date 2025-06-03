import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { TaskStreak as TaskStreakType } from '@/types/calendar';

interface TaskStreakProps {
  streak: TaskStreakType;
  plantName: string;
}

const badges = [
  { name: 'Early Bird', icon: '🌅', requirement: 5 },
  { name: 'Consistent Care', icon: '🌱', requirement: 10 },
  { name: 'Master Gardener', icon: '👨‍🌾', requirement: 30 },
  { name: 'Plant Whisperer', icon: '🌿', requirement: 50 },
];

export default function TaskStreak({ streak, plantName }: TaskStreakProps) {
  const nextBadge = badges.find(badge => !streak.badges.includes(badge.name));
  const progress = nextBadge
    ? (streak.currentStreak / nextBadge.requirement) * 100
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-white rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-4">Task Streak</h2>

      <div className="space-y-6">
        {/* Current Streak */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-green-500 text-xl" />
            <div>
              <div className="text-sm text-gray-600">Current Streak</div>
              <div className="text-2xl font-bold">{streak.currentStreak} days</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FiAward className="text-yellow-500 text-xl" />
            <div>
              <div className="text-sm text-gray-600">Longest Streak</div>
              <div className="text-2xl font-bold">{streak.longestStreak} days</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progress to next badge</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-green-500"
            />
          </div>
          {nextBadge && (
            <div className="text-sm text-gray-600">
              {nextBadge.requirement - streak.currentStreak} more days until{' '}
              <span className="font-medium">{nextBadge.name}</span> {nextBadge.icon}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FiAward className="text-yellow-500" />
            <span className="font-medium">Earned Badges</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {badges.map(badge => (
              <div
                key={badge.name}
                className={`p-2 rounded-lg border ${
                  streak.badges.includes(badge.name)
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{badge.icon}</span>
                  <div>
                    <div className="font-medium">{badge.name}</div>
                    <div className="text-xs text-gray-600">
                      {badge.requirement} days
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last Completed */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FiCalendar />
          <span>
            Last task completed:{' '}
            {new Date(streak.lastCompleted).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
} 