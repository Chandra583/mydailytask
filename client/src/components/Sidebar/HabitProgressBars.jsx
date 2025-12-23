import React from 'react';
import { useHabit, TIME_PERIODS } from '../../context/HabitContext';
import { BarChart3, Sun, Sunrise, Sunset, Moon } from 'lucide-react';

// Period icons mapping
const PERIOD_ICONS = {
  morning: Sun,
  afternoon: Sunrise,
  evening: Sunset,
  night: Moon,
};

/**
 * Task Progress Bars - Daily View
 * Modern2026 design with Lucide icons and glassmorphism
 */
const HabitProgressBars = () => {
  const { habits, dailyProgress } = useHabit();

  // Calculate progress for each habit
  const habitProgress = habits.map(habit => {
    const progress = dailyProgress[habit._id] || {};
    return {
      ...habit,
      morning: progress.morning || 0,
      afternoon: progress.afternoon || 0,
      evening: progress.evening || 0,
      night: progress.night || 0,
      average: Math.round(
        ((progress.morning || 0) + (progress.afternoon || 0) + 
         (progress.evening || 0) + (progress.night || 0)) / 4
      ),
    };
  });

  return (
    <div className="glass-card p-5 hover-lift">
      <h3 className="section-title mb-4 flex items-center gap-2">
        <BarChart3 size={18} className="text-cyan-400" />
        TASK PROGRESS BY PERIOD
      </h3>

      {habitProgress.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-xl bg-gray-700/50 flex items-center justify-center mx-auto mb-3">
            <BarChart3 size={24} className="text-gray-500" />
          </div>
          <p className="text-gray-400 text-sm">No tasks yet</p>
          <p className="text-gray-500 text-xs mt-1">Add tasks to track progress</p>
        </div>
      ) : (
        <div className="space-y-4">
          {habitProgress.slice(0, 6).map((habit, index) => (
            <div 
              key={habit._id} 
              className="glass-card-light p-3 rounded-xl stagger-item"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Habit Name and Average */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-md"
                    style={{ backgroundColor: habit.color }}
                  ></div>
                  <span className="text-white text-sm font-medium truncate" style={{ maxWidth: '100px' }}>
                    {habit.name}
                  </span>
                </div>
                <span 
                  className={`badge text-xs font-bold ${
                    habit.average >= 80 ? 'badge-success' :
                    habit.average >= 50 ? 'badge-warning' :
                    habit.average > 0 ? 'badge-error' :
                    'bg-gray-700 text-gray-400 border border-gray-600'
                  }`}
                >
                  {habit.average}%
                </span>
              </div>

              {/* Time Period Bars */}
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(TIME_PERIODS).map(([key, period]) => {
                  const Icon = PERIOD_ICONS[key];
                  const value = habit[key];
                  
                  return (
                    <div key={key} className="space-y-1">
                      <div 
                        className="h-4 rounded-md overflow-hidden bg-gray-700/50 relative"
                        title={`${period.name}: ${value}%`}
                      >
                        <div 
                          className="h-full rounded-md transition-all duration-700 ease-out"
                          style={{ 
                            width: `${value}%`,
                            background: `linear-gradient(90deg, ${period.color}, ${period.color}99)`,
                            boxShadow: value > 0 ? `0 0 8px ${period.color}40` : 'none',
                          }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-center gap-0.5">
                        <Icon size={10} style={{ color: period.color }} />
                        <span 
                          className="text-[10px] font-medium"
                          style={{ color: value > 0 ? period.color : '#6b7280' }}
                        >
                          {value}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="flex flex-wrap gap-3 justify-center">
          {Object.values(TIME_PERIODS).map((period) => {
            const Icon = PERIOD_ICONS[period.id];
            return (
              <div 
                key={period.id}
                className="flex items-center gap-1.5 text-xs"
              >
                <div 
                  className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${period.color}25` }}
                >
                  <Icon size={12} style={{ color: period.color }} />
                </div>
                <span className="text-gray-400 text-xs">{period.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HabitProgressBars;
