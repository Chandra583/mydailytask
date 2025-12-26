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
 * RULE: Average of ONLY FILLED periods (periods > 0%)
 * If ANY period is 100%, show 100% (task is complete)
 */
const TopHabitsChart = () => {
  const { habits, dailyProgress } = useHabit();

  // Calculate display value for each habit
  const habitCompletions = habits.map(habit => {
    const progress = dailyProgress[habit._id] || {};
    const morning = progress.morning || 0;
    const afternoon = progress.afternoon || 0;
    const evening = progress.evening || 0;
    const night = progress.night || 0;
    
    // Check if task is complete (ANY period at 100%)
    const isComplete = morning === 100 || afternoon === 100 || evening === 100 || night === 100;
    
    // Calculate display value
    let displayValue;
    if (isComplete) {
      displayValue = 100;
    } else {
      // Average of ONLY FILLED periods (> 0%)
      const filledPeriods = [morning, afternoon, evening, night].filter(p => p > 0);
      displayValue = filledPeriods.length > 0 
        ? Math.round(filledPeriods.reduce((sum, p) => sum + p, 0) / filledPeriods.length)
        : 0;
    }
    
    return {
      ...habit,
      displayValue,
      isComplete,
      morning,
      afternoon,
      evening,
      night,
    };
  });

  // Sort by displayValue and take top 5
  const topHabits = habitCompletions
    .sort((a, b) => b.displayValue - a.displayValue)
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
                  
                  {/* Percentage - 100% if complete, otherwise average */}
                  <div className="text-right">
                    <span 
                      className="stat-number text-lg"
                      style={{ color: habit.isComplete ? '#10b981' : habit.displayValue >= 50 ? '#fbbf24' : '#f97316' }}
                    >
                      {habit.displayValue}%
                    </span>
                    {habit.isComplete && (
                      <div className="text-[10px] text-green-400">✓ Complete</div>
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ 
                      width: `${habit.displayValue}%`,
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
