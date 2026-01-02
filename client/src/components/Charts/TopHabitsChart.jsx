import React, { useMemo } from 'react';
import { useHabit, TIME_PERIODS } from '../../context/HabitContext';
import { Trophy, Award, Medal, Star, Sun, Sunrise, Sunset, Moon, Calendar } from 'lucide-react';
import { format } from 'date-fns';

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
  const { habits, dailyProgress, progressResetKey, selectedDate, isToday } = useHabit();
  
  // CRITICAL: Check if viewing today or a past date
  const isViewingToday = isToday();
  const displayDate = format(selectedDate, 'MMM d');

  // Calculate display value for each habit
  // GOLDEN RULE: ALL values derived from dailyProgress, never from habit properties
  const { habitCompletions, topHabits } = useMemo(() => {
    console.log(`🏆 Recalculating topHabits (resetKey: ${progressResetKey})`);
    
    const completions = habits.map(habit => {
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
    const top = completions
      .sort((a, b) => b.displayValue - a.displayValue)
      .slice(0, 5);

    return { habitCompletions: completions, topHabits: top };
  }, [habits, dailyProgress, progressResetKey]);

  return (
    <div className="glass-card p-5 hover-lift">
      <h3 className="section-title mb-4 flex items-center gap-2">
        <Trophy size={18} className="text-yellow-500" />
        {isViewingToday ? (
          'TOP 5 TASKS TODAY'
        ) : (
          <span className="flex items-center gap-2">
            TOP 5 TASKS
            <span className="text-gray-500 text-xs font-normal flex items-center gap-1">
              <Calendar size={12} />
              {displayDate}
            </span>
          </span>
        )}
      </h3>

      {topHabits.length === 0 ? (
        <div className="text-center py-4">
          <Trophy size={24} className="text-gray-500 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">No task data yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {topHabits.map((habit, index) => {
            const rankConfig = RANK_CONFIG[index];
            const RankIcon = rankConfig.icon;
            
            return (
              <div 
                key={habit._id} 
                className="glass-card-light p-2 rounded-lg transition-all hover:scale-[1.02] stagger-item"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <div 
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ backgroundColor: rankConfig.bgColor }}
                    >
                      <RankIcon size={12} style={{ color: rankConfig.color }} />
                    </div>
                    
                    {/* Task Name */}
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-medium truncate" style={{ maxWidth: '100px' }}>
                        {habit.name}
                      </span>
                      <span className="text-gray-500 text-xs">
                        #{index + 1} {isViewingToday ? 'Today' : displayDate}
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
                <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden mb-1">
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
