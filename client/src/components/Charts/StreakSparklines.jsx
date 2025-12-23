import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { useHabit } from '../../context/HabitContext';

/**
 * Streak Sparklines Component
 * Mini trend lines showing streak history for top tasks
 */
const StreakSparklines = () => {
  const { habits, streaks } = useHabit();

  // Combine streak data with habit info
  const streakData = streaks.map(streak => {
    const habit = habits.find(h => h._id === streak.habitId);
    return {
      ...streak,
      name: habit?.name || 'Unknown Task',
      color: habit?.color || '#e91e63',
    };
  }).slice(0, 6);

  // Generate mock sparkline data (14 days history)
  const generateSparklineData = (currentStreak, habitIndex) => {
    return Array.from({ length: 14 }, (_, i) => {
      // Simulate streak pattern
      const dayFromEnd = 14 - i;
      let completed = dayFromEnd <= currentStreak;
      
      // Add some breaks for variety
      if (habitIndex > 2 && dayFromEnd > currentStreak + 2) {
        completed = Math.random() > 0.3;
      }
      
      return {
        day: i,
        value: completed ? 100 : 0,
      };
    });
  };

  const getFireEmoji = (days) => {
    if (days >= 30) return '🔥🔥🔥';
    if (days >= 14) return '🔥🔥';
    if (days >= 7) return '🔥';
    return '✨';
  };

  const getStreakStatus = (days) => {
    if (days >= 30) return { text: 'On Fire!', color: '#ef4444' };
    if (days >= 14) return { text: 'Hot Streak!', color: '#f97316' };
    if (days >= 7) return { text: 'Building!', color: '#fbbf24' };
    return { text: 'Starting', color: '#4ade80' };
  };

  return (
    <div className="bg-primary-navy rounded-lg p-4">
      <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
        <span>🔥</span>
        STREAK TRENDS
      </h3>

      {streakData.length === 0 ? (
        <div className="text-center py-6">
          <span className="text-4xl">📅</span>
          <p className="text-gray-400 text-sm mt-2">No active streaks yet</p>
          <p className="text-gray-500 text-xs mt-1">Complete tasks consistently to build streaks!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {streakData.map((streak, index) => {
            const sparklineData = generateSparklineData(streak.currentStreak, index);
            const status = getStreakStatus(streak.currentStreak);
            
            return (
              <div 
                key={streak.habitId || index}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-primary-slate transition-all"
              >
                {/* Streak Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: streak.color }}
                    ></div>
                    <span 
                      className="text-white text-sm truncate font-medium"
                      title={streak.name}
                    >
                      {streak.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-lg">{getFireEmoji(streak.currentStreak)}</span>
                    <span className="text-white font-bold">{streak.currentStreak}</span>
                    <span className="text-gray-400 text-xs">days</span>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="w-24 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sparklineData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={streak.color}
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Status Badge */}
                <div 
                  className="px-2 py-1 rounded text-xs font-bold flex-shrink-0"
                  style={{ 
                    backgroundColor: `${status.color}20`,
                    color: status.color,
                  }}
                >
                  {status.text}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between text-xs text-gray-400">
          <span>14 days ago</span>
          <span>← Streak History →</span>
          <span>Today</span>
        </div>
        <div className="flex justify-center gap-4 mt-2">
          <div className="flex items-center gap-1">
            <span>✨</span>
            <span className="text-gray-400 text-xs">1-6 days</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔥</span>
            <span className="text-gray-400 text-xs">7-13 days</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔥🔥</span>
            <span className="text-gray-400 text-xs">14-29 days</span>
          </div>
          <div className="flex items-center gap-1">
            <span>🔥🔥🔥</span>
            <span className="text-gray-400 text-xs">30+ days</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakSparklines;
