import React, { useMemo } from 'react';
import { useHabit, TIME_PERIODS, getCurrentTimePeriod } from '../../context/HabitContext';
import { BarChart2, Sun, Sunrise, Sunset, Moon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';

// Time period colors
const PERIOD_COLORS = {
  morning: '#06b6d4',
  afternoon: '#fbbf24',
  evening: '#fb7185',
  night: '#a855f7',
};

const PERIOD_ICONS = {
  morning: Sun,
  afternoon: Sunrise,
  evening: Sunset,
  night: Moon,
};

/**
 * Daily Task Progress Chart
 * Horizontal bar chart showing completion % for each time period
 */
const DailyTaskProgressChart = () => {
  const {
    habits,
    dailyProgress,
    progressResetKey,
  } = useHabit();

  const currentPeriod = getCurrentTimePeriod();

  // Calculate period averages
  const periodData = useMemo(() => {
    if (habits.length === 0) {
      return Object.values(TIME_PERIODS).map(period => ({
        id: period.id,
        name: period.name,
        value: 0,
        color: PERIOD_COLORS[period.id],
        isCurrent: period.id === currentPeriod,
      }));
    }

    const totals = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    
    habits.forEach(habit => {
      const progress = dailyProgress[habit._id] || {};
      totals.morning += progress.morning || 0;
      totals.afternoon += progress.afternoon || 0;
      totals.evening += progress.evening || 0;
      totals.night += progress.night || 0;
    });

    return Object.values(TIME_PERIODS).map(period => ({
      id: period.id,
      name: period.name,
      value: Math.round(totals[period.id] / habits.length),
      color: PERIOD_COLORS[period.id],
      isCurrent: period.id === currentPeriod,
    }));
  }, [habits, dailyProgress, currentPeriod, progressResetKey]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 size={18} className="text-cyan-400" />
        <h3 className="text-white font-bold text-sm">Progress by Time Period</h3>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="space-y-3">
        {periodData.map((period) => {
          const Icon = PERIOD_ICONS[period.id];
          
          return (
            <div key={period.id} className="flex items-center gap-3">
              {/* Period Icon & Name */}
              <div 
                className={`flex items-center gap-2 w-28 flex-shrink-0 ${
                  period.isCurrent ? 'opacity-100' : 'opacity-70'
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${period.color}22` }}
                >
                  <Icon size={16} style={{ color: period.color }} />
                </div>
                <span className={`text-sm ${period.isCurrent ? 'text-white font-medium' : 'text-slate-400'}`}>
                  {period.name}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 relative">
                <div className="h-8 bg-slate-700/50 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ 
                      width: `${Math.max(period.value, 2)}%`,
                      backgroundColor: period.color,
                      opacity: period.value > 0 ? 1 : 0.3
                    }}
                  >
                    {period.value > 20 && (
                      <span className="text-white text-xs font-bold">{period.value}%</span>
                    )}
                  </div>
                </div>
                {period.value <= 20 && (
                  <span 
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold"
                    style={{ color: period.value > 0 ? period.color : '#64748b' }}
                  >
                    {period.value}%
                  </span>
                )}
                
                {/* Current indicator */}
                {period.isCurrent && (
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                    <span className="relative flex h-3 w-3">
                      <span 
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: period.color }}
                      />
                      <span 
                        className="relative inline-flex rounded-full h-3 w-3"
                        style={{ backgroundColor: period.color }}
                      />
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer - Average */}
      <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
        <span className="text-slate-400 text-sm">Daily Average</span>
        <span className="text-white font-bold">
          {Math.round(periodData.reduce((sum, p) => sum + p.value, 0) / 4)}%
        </span>
      </div>
    </div>
  );
};

export default DailyTaskProgressChart;
