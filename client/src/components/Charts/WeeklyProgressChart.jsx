import React, { useState, useEffect, useCallback } from 'react';
import { 
  AreaChart,
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { ChevronLeft, ChevronRight, Calendar, Trophy, Loader2, TrendingUp } from 'lucide-react';
import api from '../../utils/api';

/**
 * Weekly Progress Chart
 * Shows weekly progress overview with navigation between weeks
 * Fetches data from /api/progress/weekly/:weekStart
 */
const WeeklyProgressChart = () => {
  const [weekData, setWeekData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getStartOfWeek(new Date()));

  // Get start of week (Sunday)
  function getStartOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0, 0, 0, 0);
    return formatDate(d);
  }

  // Format date as YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Add days to date string
  function addDays(dateStr, days) {
    const date = new Date(dateStr + 'T00:00:00');
    date.setDate(date.getDate() + days);
    return formatDate(date);
  }

  // Format week range for display
  function formatWeekRange(weekStart) {
    const start = new Date(weekStart + 'T00:00:00');
    const end = new Date(weekStart + 'T00:00:00');
    end.setDate(end.getDate() + 6);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
    
    if (startMonth === endMonth) {
      return `${startMonth} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    }
    return `${startMonth} ${start.getDate()} - ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
  }

  // Fetch weekly data
  const fetchWeeklyData = useCallback(async (weekStart) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/progress/weekly/${weekStart}`);
      setWeekData(response.data);
    } catch (err) {
      console.error('Failed to fetch weekly progress:', err);
      setError('Failed to load weekly data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeeklyData(currentWeekStart);
  }, [currentWeekStart, fetchWeeklyData]);

  // Navigation handlers
  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    const nextWeek = addDays(currentWeekStart, 7);
    const today = getStartOfWeek(new Date());
    // Don't allow navigating to future weeks
    if (nextWeek <= today) {
      setCurrentWeekStart(nextWeek);
    }
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(getStartOfWeek(new Date()));
  };

  const isCurrentWeek = currentWeekStart === getStartOfWeek(new Date());
  const canGoNext = !isCurrentWeek;

  // Get today's date for filtering future days
  const todayStr = formatDate(new Date());

  // Filter data for AreaChart - only show days up to today (use null for future)
  const chartData = weekData?.days?.map(day => {
    // If date is in the future, set progress to null so line doesn't connect
    if (day.date > todayStr) {
      return { ...day, progress: null, isFuture: true };
    }
    return { ...day, isFuture: false };
  }) || [];

  // Get color based on completion percentage
  const getBarColor = (completion, isToday) => {
    if (completion >= 90) return '#4ade80'; // Bright green
    if (completion >= 70) return '#fbbf24'; // Yellow
    if (completion >= 50) return '#fb923c'; // Orange
    if (completion > 0) return '#ef4444'; // Red
    return '#374151'; // No data gray
  };

  const CustomAreaTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      // Don't show tooltip for future days
      if (data.isFuture) {
        return (
          <div className="bg-primary-slate p-3 rounded-lg shadow-lg border border-gray-600">
            <p className="text-gray-400 font-bold">
              {data.dayName}, {data.date}
            </p>
            <p className="text-gray-500 text-sm">Future - no data yet</p>
          </div>
        );
      }
      
      return (
        <div className="bg-primary-slate p-3 rounded-lg shadow-lg border border-gray-600">
          <p className="text-white font-bold">
            {data.dayName}, {data.date}
          </p>
          <p className="text-2xl font-bold" style={{ color: getBarColor(data.progress, false) }}>
            {data.progress}%
          </p>
          {data.completedTasks !== undefined && (
            <p className="text-gray-400 text-xs mt-1">
              {data.completedTasks}/{data.totalTasks} tasks completed
            </p>
          )}
          {data.isToday && (
            <p className="text-pink-400 text-xs mt-1">Today</p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-600">
          <p className="text-white font-bold">
            {data.dayName}, {data.date}
          </p>
          <p className="text-2xl font-bold" style={{ color: getBarColor(data.progress, false) }}>
            {data.progress}%
          </p>
          {data.isToday && (
            <p className="text-pink-400 text-xs mt-1">Today</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="glass-card p-6 flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-6 h-96 flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!weekData) return null;

  return (
    <div className="glass-card p-5 hover-lift">
      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={goToPreviousWeek}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
            title="Previous Week"
          >
            <ChevronLeft className="w-5 h-5 text-gray-300" />
          </button>
          
          <div className="text-center">
            <h3 className="section-title flex items-center gap-2 justify-center">
              <Calendar size={18} className="text-blue-400" />
              WEEKLY PROGRESS
            </h3>
            <p className="text-gray-400 text-sm mt-1">{formatWeekRange(currentWeekStart)}</p>
          </div>
          
          <button 
            onClick={goToNextWeek}
            disabled={!canGoNext}
            className={`p-2 rounded-lg transition-colors ${
              canGoNext 
                ? 'bg-gray-700 hover:bg-gray-600' 
                : 'bg-gray-800 cursor-not-allowed opacity-50'
            }`}
            title="Next Week"
          >
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="text-right">
          {!isCurrentWeek && (
            <button 
              onClick={goToCurrentWeek}
              className="text-xs text-blue-400 hover:text-blue-300 mb-1 block"
            >
              Go to Current Week →
            </button>
          )}
          <div className="text-gray-400 text-xs uppercase">Weekly Average</div>
          <div className="text-2xl font-bold text-white">{weekData.weeklyAverage}%</div>
        </div>
      </div>

      {/* Main Trend Chart (AreaChart like Daily) */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={16} className="text-emerald-400" />
          <span className="text-gray-400 text-xs uppercase">Weekly Trend</span>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="weeklyGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.9} />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.9} />
                </linearGradient>
                <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.6} />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.1} />
                </linearGradient>
                <filter id="weeklyGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
              
              <XAxis 
                dataKey="dayName"
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
              />
              
              <YAxis 
                domain={[0, 100]}
                tick={{ fill: '#9ca3af', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              
              <Tooltip content={<CustomAreaTooltip />} />
              
              <ReferenceLine 
                y={80} 
                stroke="#22c55e" 
                strokeDasharray="5 5" 
                label={{ value: 'Goal', fill: '#22c55e', fontSize: 10, position: 'right' }} 
              />
              
              <Area
                type="natural"
                dataKey="progress"
                stroke="url(#weeklyGradient)"
                strokeWidth={3}
                fill="url(#weeklyFill)"
                connectNulls={false}
                animationDuration={800}
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  // Don't show dots for future days
                  if (payload.isFuture || payload.progress === null) {
                    return null;
                  }
                  // Pulsing dot for today (like DailyProgressTrendChart)
                  if (payload.isToday) {
                    return (
                      <g>
                        <circle cx={cx} cy={cy} r={10} fill="#ec4899" opacity={0.3} />
                        <circle cx={cx} cy={cy} r={6} fill="#ec4899" stroke="#fff" strokeWidth={2} />
                        <circle cx={cx} cy={cy} r={14} fill="none" stroke="#ec4899" strokeWidth={1} opacity={0.5}>
                          <animate attributeName="r" from="8" to="18" dur="1.5s" repeatCount="indefinite" />
                          <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
                        </circle>
                      </g>
                    );
                  }
                  if (payload.progress >= 90) {
                    return <circle cx={cx} cy={cy} r={5} fill="#4ade80" stroke="#fff" strokeWidth={2} />;
                  }
                  if (payload.progress >= 70) {
                    return <circle cx={cx} cy={cy} r={4} fill="#fbbf24" stroke="#fff" strokeWidth={1} />;
                  }
                  return <circle cx={cx} cy={cy} r={3} fill="#8b5cf6" stroke="#fff" strokeWidth={1} />;
                }}
                activeDot={{ r: 8, fill: '#ec4899', stroke: '#fff', strokeWidth: 3, filter: 'url(#weeklyGlow)' }}
                style={{ filter: 'url(#weeklyGlow)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={weekData.days}
            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis 
              dataKey="dayName"
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <ReferenceLine 
              y={80} 
              stroke="#22c55e" 
              strokeDasharray="5 5" 
              label={{ value: 'Goal', fill: '#22c55e', fontSize: 10, position: 'right' }} 
            />
            <Bar 
              dataKey="progress" 
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
              animationDuration={800}
            >
              {weekData.days.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getBarColor(entry.progress, entry.isToday)}
                  stroke={entry.isToday ? '#fff' : 'transparent'}
                  strokeWidth={entry.isToday ? 2 : 0}
                  style={{
                    filter: entry.isToday ? 'drop-shadow(0 0 6px rgba(255,255,255,0.4))' : 'none'
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Day Details Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6 pt-4 border-t border-gray-700">
        {weekData.days.map((day, index) => (
          <div 
            key={index}
            className={`text-center p-3 rounded-lg transition-all ${
              day.isToday 
                ? 'bg-pink-500 bg-opacity-20 ring-1 ring-pink-400' 
                : 'bg-gray-800 hover:bg-gray-700'
            }`}
          >
            <div className="text-gray-400 text-xs">{day.dayName}</div>
            <div className="font-bold text-white text-sm">
              {new Date(day.date + 'T00:00:00').getDate()}
            </div>
            <div 
              className="text-xs font-bold mt-1"
              style={{ color: getBarColor(day.progress, false) }}
            >
              {day.progress}%
            </div>
          </div>
        ))}
      </div>

      {/* Top 5 Habits This Week */}
      {weekData.topHabits && weekData.topHabits.length > 0 && (
        <div className="pt-4 border-t border-gray-700">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-300 mb-3">
            <Trophy size={16} className="text-yellow-400" />
            TOP HABITS THIS WEEK
          </h4>
          <div className="space-y-2">
            {weekData.topHabits.map((habit, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 rounded-lg bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${
                    idx === 0 ? 'text-yellow-400' : 
                    idx === 1 ? 'text-gray-300' : 
                    idx === 2 ? 'text-amber-600' : 'text-gray-500'
                  }`}>
                    #{idx + 1}
                  </span>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: habit.color || '#3b82f6' }}
                  />
                  <span className="text-gray-200 text-sm">{habit.name}</span>
                </div>
                <span 
                  className="font-bold text-sm"
                  style={{ color: getBarColor(habit.completion, false) }}
                >
                  {habit.completion}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-gray-700">
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
          <div className="w-3 h-3 rounded" style={{ backgroundColor: '#374151' }}></div>
          <span className="text-gray-400 text-xs">No data</span>
        </div>
      </div>
    </div>
  );
};

export default WeeklyProgressChart;
