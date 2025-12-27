import React, { useMemo, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine
} from 'recharts';
import { useHabit } from '../../context/HabitContext';
import { format, subDays, isToday as checkIsToday, isBefore, startOfDay } from 'date-fns';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';

/**
 * Weekly Overview Chart
 * Horizontal bar chart showing last 7 days progress
 * Only shows days since user started using the app
 */
const WeeklyOverviewChart = () => {
  const { 
    selectedDate, 
    dailyStats, 
    userStartDate, 
    getDaysSinceStart,
    isBeforeUserStart,
    historicalProgress,
    fetchProgressForDate,
    habits,
    dailyProgress,
    progressResetKey
  } = useHabit();

  const daysSinceStart = getDaysSinceStart();
  const daysToShow = Math.min(daysSinceStart, 7);

  // Fetch historical progress for the last 7 days
  useEffect(() => {
    const fetchHistoricalData = async () => {
      for (let i = 0; i < 7; i++) {
        const date = subDays(new Date(), i);
        const dateKey = format(date, 'yyyy-MM-dd');
        await fetchProgressForDate(dateKey);
      }
    };
    fetchHistoricalData();
  }, [fetchProgressForDate]);

  // Calculate completion for a date
  // GOLDEN RULE: For TODAY, use dailyProgress directly, NOT historicalProgress
  // ANY period at 100% = task is COMPLETE
  const calculateCompletion = (dateKey, isCurrentDay = false) => {
    // CRITICAL: For today, use current dailyProgress state
    // This ensures we never show stale historical data for today
    const progress = isCurrentDay ? dailyProgress : historicalProgress[dateKey];
    
    if (!progress || Object.keys(progress).length === 0) {
      return 0;
    }
    
    let completedTasks = 0;
    let totalTasks = 0;
    
    Object.values(progress).forEach(p => {
      totalTasks++;
      // A task is complete if ANY period is 100%
      if ((p.morning || 0) === 100 || 
          (p.afternoon || 0) === 100 || 
          (p.evening || 0) === 100 || 
          (p.night || 0) === 100) {
        completedTasks++;
      }
    });
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  // Generate last 7 days data based on user start date
  // GOLDEN RULE: Today's data comes from dailyStats/dailyProgress, NOT historicalProgress
  const weeklyData = useMemo(() => {
    // Log for debugging
    console.log(`📅 Recalculating weeklyData (resetKey: ${progressResetKey})`);
    
    const today = startOfDay(new Date());
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i);
      const isCurrentDay = checkIsToday(date);
      const dateKey = format(date, 'yyyy-MM-dd');
      const isBeforeStart = isBeforeUserStart(date);
      
      // For today, use current dailyStats; for past days, use historical data
      // CRITICAL: Never use historicalProgress for today's value
      let completion = 0;
      if (!isBeforeStart) {
        if (isCurrentDay) {
          // GOLDEN RULE: For today, use ONLY dailyStats (derived from dailyProgress)
          // This is the single source of truth for today's progress
          completion = dailyStats?.overall || 0;
        } else {
          // For past days, calculate from historical data
          completion = calculateCompletion(dateKey, false);
        }
      }
      
      return {
        day: format(date, 'EEE'),
        date: format(date, 'd'),
        fullDate: format(date, 'MMM d'),
        dateKey,
        completion,
        isToday: isCurrentDay,
        isBeforeStart,
        dayNumber: isBeforeStart ? null : daysSinceStart - (6 - i),
      };
    });
  }, [selectedDate, dailyStats?.overall, userStartDate, daysSinceStart, historicalProgress, dailyProgress, progressResetKey]);

  // Get color based on completion percentage
  const getBarColor = (completion, isBeforeStart) => {
    if (isBeforeStart) return '#1e293b'; // Dark gray for before start
    if (completion >= 90) return '#4ade80'; // Bright green
    if (completion >= 70) return '#fbbf24'; // Yellow
    if (completion >= 50) return '#fb923c'; // Orange
    if (completion > 0) return '#ef4444'; // Red
    return '#374151'; // No data gray
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      if (data.isBeforeStart) {
        return (
          <div className="bg-primary-slate p-3 rounded-lg shadow-lg border border-gray-600">
            <p className="text-gray-400 font-bold">{data.day}, {data.fullDate}</p>
            <p className="text-gray-500 text-sm">Before you started</p>
            <p className="text-gray-500 text-xs">No data available</p>
          </div>
        );
      }
      
      return (
        <div className="bg-primary-slate p-3 rounded-lg shadow-lg border border-gray-600">
          <p className="text-white font-bold">
            {data.day}, {data.fullDate}
          </p>
          <p className="text-2xl font-bold" style={{ color: getBarColor(data.completion, false) }}>
            {data.completion}%
          </p>
          {data.isToday && (
            <p className="text-accent-pink text-xs mt-1">Today</p>
          )}
          {data.dayNumber && (
            <p className="text-gray-400 text-xs mt-1">Day {data.dayNumber}</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Calculate weekly average (only for active days)
  const activeDays = weeklyData.filter(d => !d.isBeforeStart);
  const weeklyAverage = activeDays.length > 0 
    ? Math.round(activeDays.reduce((sum, d) => sum + d.completion, 0) / activeDays.length)
    : 0;

  return (
    <div className="glass-card p-5 hover-lift">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-title flex items-center gap-2">
            <Calendar size={18} className="text-blue-400" />
            {daysToShow < 7 
              ? `LAST ${daysToShow} DAY${daysToShow === 1 ? '' : 'S'} TASK PROGRESS`
              : 'LAST 7 DAYS TASK PROGRESS'
            }
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            {daysToShow < 7 
              ? `Showing ${daysToShow} day${daysToShow === 1 ? '' : 's'} since you started`
              : 'Weekly completion overview'
            }
          </p>
        </div>
        <div className="text-right">
          <div className="label-text">
            {daysToShow < 7 ? `${daysToShow}-Day` : '7-Day'} Completion
          </div>
          <div className="stat-number text-xl">{weeklyAverage}%</div>
        </div>
      </div>

      {/* Message for new users */}
      {daysToShow < 7 && (
        <div className="mb-4 glass-card-light p-3 rounded-xl border-l-4 border-accent-pink">
          <p className="text-gray-400 text-sm flex items-center gap-2">
            <TrendingUp size={16} className="text-accent-pink" />
            <span>
              Keep going! {7 - daysToShow} more day{7 - daysToShow === 1 ? '' : 's'} to see your full 7-day history.
            </span>
          </p>
        </div>
      )}

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weeklyData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            
            <YAxis 
              type="category" 
              dataKey="day"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
              width={40}
            />
            
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            
            <ReferenceLine 
              x={80} 
              stroke="#22c55e" 
              strokeDasharray="5 5" 
              label={{ value: 'Goal', fill: '#22c55e', fontSize: 10, position: 'top' }} 
            />
            
            <Bar 
              dataKey="completion" 
              radius={[0, 4, 4, 0]}
              maxBarSize={25}
              animationDuration={800}
            >
              {weeklyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.completion, entry.isBeforeStart)}
                  stroke={entry.isToday ? '#fff' : 'transparent'}
                  strokeWidth={entry.isToday ? 2 : 0}
                  style={{
                    filter: entry.isToday ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none',
                    opacity: entry.isBeforeStart ? 0.3 : 1,
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Day Details */}
      <div className="grid grid-cols-7 gap-1 mt-4 pt-4 border-t border-gray-700">
        {weeklyData.map((day, index) => (
          <div 
            key={index}
            className={`text-center p-2 rounded-lg transition-all ${
              day.isBeforeStart 
                ? 'opacity-30 cursor-not-allowed' 
                : 'cursor-pointer hover:bg-gray-700'
            } ${
              day.isToday ? 'bg-accent-pink bg-opacity-20 ring-1 ring-accent-pink' : ''
            }`}
          >
            <div className="text-gray-400 text-xs">{day.day}</div>
            <div className={`font-bold text-sm ${day.isBeforeStart ? 'text-gray-600' : 'text-white'}`}>
              {day.date}
            </div>
            <div 
              className="text-xs font-bold mt-1"
              style={{ color: day.isBeforeStart ? '#4b5563' : getBarColor(day.completion, false) }}
            >
              {day.isBeforeStart ? '-' : `${day.completion}%`}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#4ade80' }}></div>
          <span className="text-gray-400 text-xs">90%+</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fbbf24' }}></div>
          <span className="text-gray-400 text-xs">70-89%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#fb923c' }}></div>
          <span className="text-gray-400 text-xs">50-69%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span className="text-gray-400 text-xs">1-49%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded opacity-30" style={{ backgroundColor: '#1e293b' }}></div>
          <span className="text-gray-400 text-xs">No data</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyOverviewChart;
