import React from 'react';
import { useHabit } from '../../context/HabitContext';
import { Flame, Calendar, Zap, Award, Trophy, Sparkles, Info } from 'lucide-react';

/**
 * Active Streaks Component
 * Modern 2025 design with Lucide icons and glassmorphism
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
    <div className="glass-card p-5 hover-lift">
      <h3 className="section-title mb-4 flex items-center gap-2">
        <Flame size={18} className="text-orange-500" />
        TOP 10 ACTIVE STREAKS
      </h3>

      {streakData.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-gray-500" />
          </div>
          <p className="text-gray-400 text-sm font-medium">No active streaks yet</p>
          <p className="text-gray-500 text-xs mt-2 max-w-[200px] mx-auto">
            Complete tasks consistently to build streaks!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {streakData.map((streak, index) => {
            const { icon: StreakIcon, color: iconColor } = getStreakIcon(streak.currentStreak);
            const badge = getStreakBadge(streak.currentStreak);
            
            return (
              <div 
                key={streak.habitId || index}
                className="glass-card-light p-3 rounded-xl transition-all hover:scale-[1.02] stagger-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Streak indicator bar */}
                    <div 
                      className="w-1.5 h-10 rounded-full"
                      style={{ 
                        background: `linear-gradient(180deg, ${streak.color}, ${streak.color}66)`,
                        boxShadow: `0 0 8px ${streak.color}40`
                      }}
                    ></div>
                    
                    {/* Task info */}
                    <div>
                      <span className="text-white text-sm font-medium truncate block" style={{ maxWidth: '100px' }}>
                        {streak.name}
                      </span>
                      <span className="text-gray-500 text-xs">
                        {streak.currentStreak} day{streak.currentStreak !== 1 ? 's' : ''} streak
                      </span>
                    </div>
                  </div>
                  
                  {/* Streak count */}
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ 
                        backgroundColor: `${iconColor}20`,
                        boxShadow: `0 0 12px ${iconColor}30`
                      }}
                    >
                      <StreakIcon size={20} style={{ color: iconColor }} />
                    </div>
                    <div className="text-right">
                      <span className="stat-number text-xl text-white">{streak.currentStreak}</span>
                      <div className={`${badge.class} text-[9px] mt-0.5`}>
                        {badge.text}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Streak Tips */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="flex items-center gap-2 justify-center text-gray-400 text-xs">
          <Sparkles size={14} className="text-yellow-500" />
          <span>Complete tasks daily to maintain your streaks!</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 justify-center mt-3">
        {[
          { days: '30+', icon: Trophy, color: '#ef4444', label: 'Legendary' },
          { days: '14+', icon: Award, color: '#f97316', label: 'On Fire' },
          { days: '7+', icon: Flame, color: '#fbbf24', label: 'Strong' },
          { days: '1+', icon: Zap, color: '#22c55e', label: 'Building' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.days}
              className="flex items-center gap-1 px-2 py-1 rounded-md"
              style={{ backgroundColor: `${item.color}15` }}
            >
              <Icon size={10} style={{ color: item.color }} />
              <span className="text-[10px] text-gray-400">{item.days}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActiveStreaks;
