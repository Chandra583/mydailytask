import React, { useEffect, useMemo } from 'react';
import { useHabit } from '../../context/HabitContext';
import { format, subDays, startOfDay, isToday as checkIsToday } from 'date-fns';
import { Activity, Flame, TrendingUp, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * Task Consistency Heatmap
 * Shows consistency grid for tasks based on actual user activity
 * Only shows days since user started (max 7 days)
 */
const HabitConsistencyHeatmap = () => {
  const { 
    habits, 
    selectedDate, 
    userStartDate,
    getDaysSinceStart,
    isBeforeUserStart,
    historicalProgress,
    dailyProgress,
    fetchProgressForDate,
    progressResetKey
  } = useHabit();

  const daysSinceStart = getDaysSinceStart();
  const daysToShow = Math.min(daysSinceStart, 7);

  // Fetch historical progress for the days we need to display
  useEffect(() => {
    const fetchData = async () => {
      for (let i = 0; i < 7; i++) {
        const date = subDays(new Date(), i);
        const dateKey = format(date, 'yyyy-MM-dd');
        await fetchProgressForDate(dateKey);
      }
    };
    fetchData();
  }, [fetchProgressForDate]);

  // Generate days to display
  // GOLDEN RULE: Recalculate when progress resets
  const days = useMemo(() => {
    console.log(`📅 Recalculating HabitConsistencyHeatmap days (resetKey: ${progressResetKey})`);
    const today = startOfDay(new Date());
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const isBeforeStart = isBeforeUserStart(date);
      const dayNumber = isBeforeStart ? null : daysSinceStart - (6 - i);
      
      return {
        day: format(date, 'EEE'),
        date: format(date, 'd'),
        fullDate: dateKey,
        isToday: checkIsToday(date),
        isBeforeStart,
        dayNumber,
      };
    });
  }, [selectedDate, userStartDate, daysSinceStart, isBeforeUserStart, progressResetKey]);

  // Get top 8 tasks for the heatmap
  const topHabits = habits.slice(0, 8);

  // Get actual completion for a habit on a specific day
  // Uses AVERAGE of all 4 periods for color coding
  const getHabitCompletion = (habitId, dateKey, isToday) => {
    let progress;
    
    if (isToday) {
      progress = dailyProgress[habitId];
    } else {
      const dayProgress = historicalProgress[dateKey];
      progress = dayProgress ? dayProgress[habitId] : null;
    }
    
    if (!progress) return 0;
    
    const morning = progress.morning || 0;
    const afternoon = progress.afternoon || 0;
    const evening = progress.evening || 0;
    const night = progress.night || 0;
    
    // Calculate average across all time periods
    const average = Math.round((morning + afternoon + evening + night) / 4);
    return average;
  };

  // Get color based on completion - using proper thresholds
  const getCellColor = (completion, isBeforeStart = false) => {
    if (isBeforeStart) return { bg: '#1e293b', text: '-', opacity: 0.3 };
    if (completion === 100) return { bg: '#4ade80', text: '✓', opacity: 1 };  // Green for 100%
    if (completion >= 50) return { bg: '#fbbf24', text: '▓', opacity: 1 };   // Yellow for 50-99%
    if (completion >= 1) return { bg: '#fb923c', text: '░', opacity: 0.8 };   // Orange for 1-49%
    return { bg: '#374151', text: '○', opacity: 0.5 };                       // Gray for 0%
  };

  // Calculate overall completion per day
  const getDayOverallCompletion = (dateKey, isToday) => {
    if (topHabits.length === 0) return 0;
    
    const total = topHabits.reduce((sum, habit) => {
      return sum + getHabitCompletion(habit._id, dateKey, isToday);
    }, 0);
    
    return Math.round(total / topHabits.length);
  };

  return (
    <div className="glass-card p-5 hover-lift">
      {/* Header */}
      <h3 className="section-title mb-2 flex items-center gap-2">
        <Activity size={18} className="text-orange-500" />
        {daysToShow < 7 
          ? `TASK CONSISTENCY - LAST ${daysToShow} DAY${daysToShow === 1 ? '' : 'S'}`
          : 'TASK CONSISTENCY - LAST 7 DAYS'
        }
      </h3>
      
      {/* Info message for new users */}
      {daysToShow < 7 && (
        <div className="mb-3 glass-card-light p-3 rounded-xl">
          <p className="text-gray-400 text-xs flex items-center gap-2">
            <TrendingUp size={14} className="text-accent-pink" />
            <span>
              Showing {daysToShow} day{daysToShow === 1 ? '' : 's'} since you started
              {userStartDate && ` on ${format(userStartDate, 'MMM d')}`}.
              Keep going!
            </span>
          </p>
        </div>
      )}

      {topHabits.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-400 text-sm">No tasks to display</p>
          <p className="text-gray-500 text-xs mt-1">Add some tasks to see your consistency</p>
        </div>
      ) : (
        <>
          {/* Heatmap Grid */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Day Headers with overall completion */}
              <thead>
                <tr>
                  <th className="text-left text-gray-400 text-xs pb-2 pr-2 w-28">Task</th>
                  {days.map((day, index) => {
                    const overallCompletion = day.isBeforeStart 
                      ? null 
                      : getDayOverallCompletion(day.fullDate, day.isToday);
                    
                    return (
                      <th 
                        key={index} 
                        className={`text-center text-xs pb-2 px-1 ${
                          day.isToday ? 'text-accent-pink font-bold' : 
                          day.isBeforeStart ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        <div className={day.isBeforeStart ? 'opacity-40' : ''}>
                          <div>{day.day}</div>
                          <div className={day.isToday ? 'text-accent-pink' : ''}>{day.date}</div>
                          {!day.isBeforeStart && (
                            <div 
                              className="text-[10px] mt-0.5"
                              style={{ 
                                color: overallCompletion >= 80 ? '#4ade80' : 
                                       overallCompletion >= 50 ? '#fbbf24' : '#fb923c' 
                              }}
                            >
                              {overallCompletion}%
                            </div>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              
              <tbody>
                {topHabits.map((habit, habitIndex) => (
                  <tr key={habit._id}>
                    <td className="py-1 pr-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: habit.color }}
                        ></div>
                        <span 
                          className="text-white text-xs truncate"
                          style={{ maxWidth: '80px' }}
                          title={habit.name}
                        >
                          {habit.name}
                        </span>
                      </div>
                    </td>
                    {days.map((day, dayIndex) => {
                      const completion = day.isBeforeStart 
                        ? 0 
                        : getHabitCompletion(habit._id, day.fullDate, day.isToday);
                      const cellStyle = getCellColor(completion, day.isBeforeStart);
                      
                      return (
                        <td key={dayIndex} className="p-1">
                          <div
                            className={`w-full aspect-square rounded flex items-center justify-center text-xs cursor-pointer transition-all hover:scale-110 ${
                              day.isToday && !day.isBeforeStart ? 'ring-1 ring-accent-pink' : ''
                            }`}
                            style={{ 
                              backgroundColor: cellStyle.bg,
                              opacity: cellStyle.opacity,
                            }}
                            title={day.isBeforeStart 
                              ? 'Before you started' 
                              : `${habit.name}: ${completion}% on ${day.day}`
                            }
                          >
                            {!day.isBeforeStart && completion >= 100 && (
                              <span className="text-white text-xs">✓</span>
                            )}
                            {day.isBeforeStart && (
                              <span className="text-gray-600 text-xs">-</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-700 flex-wrap">
            <span className="text-gray-400 text-xs">Legend:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-[#4ade80] flex items-center justify-center">
                <span className="text-white text-[10px]">✓</span>
              </div>
              <span className="text-gray-400 text-xs">100%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-[#fbbf24]"></div>
              <span className="text-gray-400 text-xs">50-99%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-[#fb923c]"></div>
              <span className="text-gray-400 text-xs">1-49%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-[#374151]"></div>
              <span className="text-gray-400 text-xs">0%</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-[#1e293b] opacity-40"></div>
              <span className="text-gray-400 text-xs">No data</span>
            </div>
          </div>

          {/* Insights */}
          <div className="mt-4 glass-card-light p-3 rounded-xl">
            <p className="text-gray-400 text-xs flex items-center gap-2">
              <Sparkles size={14} className="text-yellow-500" />
              <span>
                {daysToShow < 7 
                  ? `You're doing great! ${7 - daysToShow} more day${7 - daysToShow === 1 ? '' : 's'} until you unlock full weekly insights.`
                  : 'Tip: Tasks with gaps on weekends may need schedule adjustments'
                }
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default HabitConsistencyHeatmap;
