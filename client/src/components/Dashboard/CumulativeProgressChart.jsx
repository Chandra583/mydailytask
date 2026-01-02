import React, { useMemo } from 'react';
import { useHabit, TIME_PERIODS, getCurrentTimePeriod } from '../../context/HabitContext';
import { format } from 'date-fns';
import { TrendingUp, Clock, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// Time period colors
const PERIOD_COLORS = {
  morning: '#06b6d4',
  afternoon: '#fbbf24',
  evening: '#fb7185',
  night: '#a855f7',
};

/**
 * Cumulative Progress Chart
 * Shows daily progress as stacked area chart from 12 AM to current time
 * Color-coded by time period
 */
const CumulativeProgressChart = () => {
  const {
    habits,
    dailyProgress,
    selectedDate,
    isToday,
    currentTime,
    progressResetKey,
  } = useHabit();

  const currentPeriod = getCurrentTimePeriod();
  const currentHour = new Date().getHours();

  // Generate hourly data showing cumulative progress
  const chartData = useMemo(() => {
    if (habits.length === 0) return [];

    // Calculate period averages
    const periodProgress = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    
    habits.forEach(habit => {
      const progress = dailyProgress[habit._id] || {};
      periodProgress.morning += progress.morning || 0;
      periodProgress.afternoon += progress.afternoon || 0;
      periodProgress.evening += progress.evening || 0;
      periodProgress.night += progress.night || 0;
    });

    const habitCount = habits.length;
    const avgProgress = {
      morning: Math.round(periodProgress.morning / habitCount),
      afternoon: Math.round(periodProgress.afternoon / habitCount),
      evening: Math.round(periodProgress.evening / habitCount),
      night: Math.round(periodProgress.night / habitCount),
    };

    // Map hours to periods
    const hourToPeriod = (hour) => {
      if (hour >= 6 && hour < 12) return 'morning';
      if (hour >= 12 && hour < 18) return 'afternoon';
      if (hour >= 18 && hour < 22) return 'evening';
      return 'night';
    };

    // Generate 24-hour data
    const data = [];
    const maxHour = isToday() ? currentHour + 1 : 24;

    for (let hour = 0; hour < 24; hour++) {
      const period = hourToPeriod(hour);
      const timeLabel = format(new Date().setHours(hour, 0), 'h a');
      
      // Only show data up to current hour for today
      const showData = !isToday() || hour <= currentHour;
      
      data.push({
        hour,
        time: timeLabel,
        period,
        morning: showData && period === 'morning' ? avgProgress.morning : 0,
        afternoon: showData && period === 'afternoon' ? avgProgress.afternoon : 0,
        evening: showData && period === 'evening' ? avgProgress.evening : 0,
        night: showData && period === 'night' ? avgProgress.night : 0,
        total: showData ? avgProgress[period] : 0,
        isFuture: isToday() && hour > currentHour,
      });
    }

    return data;
  }, [habits, dailyProgress, isToday, currentHour, progressResetKey]);

  // Calculate current progress and change from previous period
  const progressStats = useMemo(() => {
    if (habits.length === 0) return { current: 0, change: 0, trend: 'neutral' };

    const periodOrder = ['morning', 'afternoon', 'evening', 'night'];
    const currentIndex = periodOrder.indexOf(currentPeriod);
    
    let currentTotal = 0;
    let previousTotal = 0;
    
    habits.forEach(habit => {
      const progress = dailyProgress[habit._id] || {};
      currentTotal += progress[currentPeriod] || 0;
      
      if (currentIndex > 0) {
        const prevPeriod = periodOrder[currentIndex - 1];
        previousTotal += progress[prevPeriod] || 0;
      }
    });

    const current = Math.round(currentTotal / habits.length);
    const previous = currentIndex > 0 ? Math.round(previousTotal / habits.length) : 0;
    const change = current - previous;
    
    return {
      current,
      change,
      trend: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  }, [habits, dailyProgress, currentPeriod, progressResetKey]);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0]?.payload;
    if (!data) return null;

    return (
      <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 shadow-xl">
        <p className="text-white font-medium text-sm mb-2">{label}</p>
        <div className="space-y-1">
          {payload.filter(p => p.value > 0).map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-400 capitalize">{entry.dataKey}:</span>
              <span className="text-white font-medium">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/30 p-5">
      {/* Header - SECONDARY styling */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={18} className="text-indigo-400/80" />
            <h2 className="text-slate-200 font-semibold text-base">📈 Progress Trend</h2>
            <span className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded">Secondary</span>
          </div>
          <p className="text-slate-500 text-xs">
            {isToday() ? 'Today' : format(selectedDate, 'MMMM d, yyyy')} • Task completion by time period
          </p>
        </div>

        {/* Current Progress Stats - Muted */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-slate-500 text-[10px]">Current Period</p>
            <p className="text-xl font-bold text-slate-300">{progressStats.current}%</p>
          </div>
          
          {progressStats.change !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${
              progressStats.trend === 'up' 
                ? 'bg-green-500/10 text-green-400/80' 
                : 'bg-red-500/10 text-red-400/80'
            }`}>
              {progressStats.trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
              <span className="text-xs font-medium">{Math.abs(progressStats.change)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      {habits.length === 0 ? (
        <div className="h-[250px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-slate-500 mb-2">📊 No data to display</p>
            <p className="text-slate-600 text-sm">Add tasks to see your progress trend</p>
          </div>
        </div>
      ) : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                {Object.entries(PERIOD_COLORS).map(([period, color]) => (
                  <linearGradient key={period} id={`gradient-${period}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0.05}/>
                  </linearGradient>
                ))}
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              
              <XAxis 
                dataKey="time" 
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                interval={2}
              />
              
              <YAxis 
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#334155' }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              
              <Tooltip content={<CustomTooltip />} />
              
              <Legend 
                verticalAlign="top" 
                height={30}
                formatter={(value) => (
                  <span className="text-slate-500 text-[10px] capitalize">{value}</span>
                )}
              />

              <Area
                type="monotone"
                dataKey="morning"
                stackId="1"
                stroke={PERIOD_COLORS.morning}
                fill={`url(#gradient-morning)`}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="afternoon"
                stackId="1"
                stroke={PERIOD_COLORS.afternoon}
                fill={`url(#gradient-afternoon)`}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="evening"
                stackId="1"
                stroke={PERIOD_COLORS.evening}
                fill={`url(#gradient-evening)`}
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="night"
                stackId="1"
                stroke={PERIOD_COLORS.night}
                fill={`url(#gradient-night)`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Period Legend - Compact */}
      <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-slate-700/30">
        {Object.entries(TIME_PERIODS).map(([id, period]) => {
          const isCurrent = id === currentPeriod;
          return (
            <div 
              key={id} 
              className={`flex items-center gap-1.5 ${isCurrent ? 'opacity-100' : 'opacity-40'}`}
            >
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: PERIOD_COLORS[id] }}
              />
              <span className={`text-xs ${isCurrent ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>
                {period.name}
                {isCurrent && <span className="ml-1 text-[10px]">(•)</span>}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CumulativeProgressChart;
