import React from 'react';
import { useHabit, TIME_PERIODS } from '../../context/HabitContext';
import { Trophy, Award, Medal, Star, Sun, Sunrise, Sunset, Moon } from 'lucide-react';

// Period icons mapping
const PERIOD_ICONS = {
  morning: Sun,
  afternoon: Sunrise,
  evening: Sunset,
  night: Moon,
};

// Rank icons and colors
const RANK_CONFIG = [
  { icon: Trophy, color: '#fbbf24', bgColor: '#fbbf2420' }, // Gold
  { icon: Award, color: '#94a3b8', bgColor: '#94a3b820' },  // Silver
  { icon: Medal, color: '#cd7f32', bgColor: '#cd7f3220' },  // Bronze
  { icon: Star, color: '#a855f7', bgColor: '#a855f720' },   // Purple
  { icon: Star, color: '#3b82f6', bgColor: '#3b82f620' },   // Blue
];

/**
 * Top Tasks Chart - Daily View
 * Modern 2025 design with Lucide icons and glassmorphism
 */
const TopHabitsChart = () => {
  const { habits, dailyProgress } = useHabit();

  // Calculate average completion for each habit
  const habitAverages = habits.map(habit => {
    const progress = dailyProgress[habit._id] || {};
    const avg = (
      (progress.morning || 0) + 
      (progress.afternoon || 0) + 
      (progress.evening || 0) + 
      (progress.night || 0)
    ) / 4;
    
    return {
      ...habit,
      average: Math.round(avg),
      morning: progress.morning || 0,
      afternoon: progress.afternoon || 0,
      evening: progress.evening || 0,
      night: progress.night || 0,
    };
  });

  // Sort by average and take top 5
  const topHabits = habitAverages
    .sort((a, b) => b.average - a.average)
    .slice(0, 5);

  return (
    <div className="glass-card p-5 hover-lift">
      <h3 className="section-title mb-4 flex items-center gap-2">
        <Trophy size={18} className="text-yellow-500" />
        TOP 5 TASKS TODAY
      </h3>

      {topHabits.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-xl bg-gray-700/50 flex items-center justify-center mx-auto mb-3">
            <Trophy size={24} className="text-gray-500" />
          </div>
          <p className="text-gray-400 text-sm">No task data yet</p>
          <p className="text-gray-500 text-xs mt-1">Complete some tasks to see rankings</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topHabits.map((habit, index) => {
            const rankConfig = RANK_CONFIG[index];
            const RankIcon = rankConfig.icon;
            
            return (
              <div 
                key={habit._id} 
                className="glass-card-light p-3 rounded-xl transition-all hover:scale-[1.02] stagger-item"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: rankConfig.bgColor }}
                    >
                      <RankIcon size={16} style={{ color: rankConfig.color }} />
                    </div>
                    
                    {/* Task Name */}
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-medium truncate" style={{ maxWidth: '100px' }}>
                        {habit.name}
                      </span>
                      <span className="text-gray-500 text-xs">
                        #{index + 1} Today
                      </span>
                    </div>
                  </div>
                  
                  {/* Percentage */}
                  <div className="text-right">
                    <span 
                      className="stat-number text-lg"
                      style={{ color: habit.average >= 80 ? '#10b981' : habit.average >= 50 ? '#fbbf24' : '#f97316' }}
                    >
                      {habit.average}%
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: `${habit.average}%`,
                      background: `linear-gradient(90deg, ${habit.color || '#e91e63'}, ${habit.color || '#e91e63'}99)`,
                      boxShadow: `0 0 10px ${habit.color || '#e91e63'}40`
                    }}
                  ></div>
                </div>
                
                {/* Time Period Breakdown */}
                <div className="flex gap-1">
                  {Object.entries(TIME_PERIODS).map(([key, period]) => {
                    const Icon = PERIOD_ICONS[key];
                    const value = habit[key];
                    
                    return (
                      <div 
                        key={key}
                        className="flex-1 flex items-center justify-center gap-1 py-1 rounded-md transition-all"
                        style={{ 
                          backgroundColor: value > 0 ? `${period.color}20` : 'rgba(55, 65, 81, 0.3)',
                        }}
                        title={`${period.name}: ${value}%`}
                      >
                        <Icon 
                          size={10} 
                          style={{ color: value > 0 ? period.color : '#6b7280' }} 
                        />
                        <span 
                          className="text-[10px] font-medium"
                          style={{ color: value > 0 ? period.color : '#6b7280' }}
                        >
                          {value}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopHabitsChart;
