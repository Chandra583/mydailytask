import React from 'react';
import { useHabit } from '../../context/HabitContext';
import { Flame, Calendar, Zap, Award, Trophy, Sparkles, Info } from 'lucide-react';

/**
 * Active Streaks Component
 * Modern2026 design with Lucide icons and glassmorphism
 */
const ActiveStreaks = () => {
  const { streaks, habits } = useHabit();

  // Combine streak data with habit info
  const streakData = streaks.map(streak => {
    const habit = habits.find(h => h._id === streak.habitId);
    return {
      ...streak,
      name: habit?.name || 'Unknown Task',
      color: habit?.color || '#e91e63',
    };
  }).slice(0, 10);

  const getStreakIcon = (days) => {
    if (days >= 30) return { icon: Trophy, color: '#ef4444' };
    if (days >= 14) return { icon: Award, color: '#f97316' };
    if (days >= 7) return { icon: Flame, color: '#fbbf24' };
    return { icon: Zap, color: '#22c55e' };
  };

  const getStreakBadge = (days) => {
    if (days >= 30) return { text: 'LEGENDARY', class: 'badge-error' };
    if (days >= 14) return { text: 'ON FIRE', class: 'badge-warning' };
    if (days >= 7) return { text: 'STRONG', class: 'badge-success' };
    return { text: 'BUILDING', class: 'badge-info' };
  };

  return (
    <div className="glass-card p-4 hover-lift">
      <h3 className="section-title mb-3 flex items-center gap-2">
        <Flame size={16} className="text-orange-500" />
        TOP 10 ACTIVE STREAKS
      </h3>

      {streakData.length === 0 ? (
        <div className="text-center py-4">
          <Calendar size={24} className="text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No active streaks yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {streakData.map((streak, index) => {
            const { icon: StreakIcon, color: iconColor } = getStreakIcon(streak.currentStreak);
            const badge = getStreakBadge(streak.currentStreak);
            
            return (
              <div 
                key={streak.habitId || index}
                className="flex items-center justify-between p-2 rounded-lg bg-primary-slate/50 hover:bg-primary-slate transition-all"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-1 h-8 rounded-full"
                    style={{ backgroundColor: streak.color }}
                  ></div>
                  <div>
                    <span className="text-white text-sm font-medium truncate block" style={{ maxWidth: '90px' }}>
                      {streak.name}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {streak.currentStreak} days streak
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <StreakIcon size={16} style={{ color: iconColor }} />
                  <span className="stat-number text-lg text-white">{streak.currentStreak}</span>
                  <span className={`${badge.class} text-[9px]`}>{badge.text}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActiveStreaks;
