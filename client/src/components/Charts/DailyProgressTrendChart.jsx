import React, { useMemo, useState, useEffect } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { useHabit, TIME_PERIODS, getCurrentTimePeriod } from '../../context/HabitContext';
import { TrendingUp, Sun, Sunrise, Sunset, Moon, CheckCircle2 } from 'lucide-react';

// Period icons mapping
const PERIOD_ICONS = {
  morning: Sun,
  afternoon: Sunrise,
  evening: Sunset,
  night: Moon,
};

/**
 * Daily Progress Trend Chart
 * Modern2026 design with Lucide icons and glassmorphism
 * FIXED: Only shows data up to current time, future times grayed out
 */
const DailyProgressTrendChart = () => {
  const { dailyStats, habits, dailyProgress } = useHabit();
  const [currentTime, setCurrentTime] = useState(new Date());
  const currentPeriod = getCurrentTimePeriod();
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();

  // Calculate AVERAGE completion percentage for each period
  // This shows the actual progress level, not just 100% count
  const getPeriodAverageCompletion = (periodId) => {
    if (habits.length === 0) return 0;
    let totalProgress = 0;
    habits.forEach(habit => {
      const progress = dailyProgress[habit._id] || {};
      totalProgress += progress[periodId] || 0;
    });
    return Math.round(totalProgress / habits.length);
  };

  // Generate hourly data points with natural variation for better UX
  // Shows actual period values with slight visual variations
  const hourlyData = useMemo(() => {
    const allHours = [
      { hour: 6, label: '6 AM', period: 'morning', variation: 0 },
      { hour: 7, label: '7 AM', period: 'morning', variation: 2 },
      { hour: 8, label: '8 AM', period: 'morning', variation: -1 },
      { hour: 9, label: '9 AM', period: 'morning', variation: 3 },
      { hour: 10, label: '10 AM', period: 'morning', variation: -2 },
      { hour: 11, label: '11 AM', period: 'morning', variation: 1 },
      { hour: 12, label: '12 PM', period: 'afternoon', variation: 0 },
      { hour: 13, label: '1 PM', period: 'afternoon', variation: 2 },
      { hour: 14, label: '2 PM', period: 'afternoon', variation: -1 },
      { hour: 15, label: '3 PM', period: 'afternoon', variation: 3 },
      { hour: 16, label: '4 PM', period: 'afternoon', variation: -2 },
      { hour: 17, label: '5 PM', period: 'afternoon', variation: 1 },
      { hour: 18, label: '6 PM', period: 'evening', variation: 0 },
      { hour: 19, label: '7 PM', period: 'evening', variation: 2 },
      { hour: 20, label: '8 PM', period: 'evening', variation: -1 },
      { hour: 21, label: '9 PM', period: 'evening', variation: 3 },
      { hour: 22, label: '10 PM', period: 'night', variation: 0 },
      { hour: 23, label: '11 PM', period: 'night', variation: 2 },
      { hour: 0, label: '12 AM', period: 'night', variation: -1 },
    ];

    // Get period values
    const periodValues = {
      morning: getPeriodAverageCompletion('morning'),
      afternoon: getPeriodAverageCompletion('afternoon'),
      evening: getPeriodAverageCompletion('evening'),
      night: getPeriodAverageCompletion('night'),
    };

    return allHours.map((h, index) => {
      // Determine if this hour is in the past, current, or future
      let isPast = false;
      let isCurrent = false;
      let isFuture = false;
      
      if (h.hour === 0) {
        isPast = currentHour >= 0 && currentHour < 6;
        isCurrent = currentHour === 0;
        isFuture = currentHour >= 6;
      } else if (h.hour < currentHour) {
        isPast = true;
      } else if (h.hour === currentHour) {
        isCurrent = true;
      } else {
        isFuture = true;
      }

      // Show ACTUAL period value with slight variation for dynamic feel
      let completion = null;
      if (isPast || isCurrent) {
        const periodValue = periodValues[h.period];
        // Add small variation for visual interest, but cap at 0-100
        const variation = h.variation;
        completion = Math.min(100, Math.max(0, periodValue + variation));
      }
      
      return {
        ...h,
        completion,
        periodValue: periodValues[h.period],
        color: TIME_PERIODS[h.period].color,
        isCurrent,
        isFuture,
        isPast,
      };
    });
  }, [dailyProgress, currentHour, habits.length]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      if (data.isFuture) {
        return (
          <div className="bg-primary-slate p-3 rounded-lg shadow-lg border border-gray-600">
            <p className="text-gray-400 font-bold">{data.label}</p>
            <p className="text-gray-500 text-sm">Future time - no any  data yet</p>
          </div>
        );
      }
      
      return (
        <div className="bg-primary-slate p-3 rounded-lg shadow-lg border border-gray-600">
          <p className="text-white font-bold">{data.label}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {data.completion}% tasks completed
          </p>
          <p className="text-gray-400 text-xs capitalize">
            {data.period} period
          </p>
          {data.isCurrent && (
            <p className="text-green-400 text-xs mt-1">← Current time</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom dot to highlight current hour and completion marks
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    
    // Don't show dots for future times
    if (payload.isFuture || payload.completion === null) {
      return null;
    }
    
    if (payload.isCurrent) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={10} fill={payload.color} opacity={0.3} />
          <circle cx={cx} cy={cy} r={6} fill={payload.color} stroke="#fff" strokeWidth={2} />
          {/* Pulsing animation indicator */}
          <circle cx={cx} cy={cy} r={12} fill="none" stroke={payload.color} strokeWidth={1} opacity={0.5}>
            <animate attributeName="r" from="8" to="16" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.8" to="0" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </g>
      );
    }
    
    // Show checkmark for 100% completion
    if (payload.completion === 100) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={6} fill="#22c55e" stroke="#fff" strokeWidth={2} />
          <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize="8">✓</text>
        </g>
      );
    }
    
    return null;
  };

  return (
    <div className="glass-card p-5 hover-lift">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="section-title flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-400" />
            DAILY PROGRESS TREND
          </h3>
          <p className="text-gray-500 text-xs mt-1">
            Task completion up to {currentHour > 12 ? currentHour - 12 : currentHour}:{currentMinute.toString().padStart(2, '0')} {currentHour >= 12 ? 'PM' : 'AM'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {Object.values(TIME_PERIODS).map((period) => {
            const Icon = PERIOD_ICONS[period.id];
            const isCurrentPeriod = currentPeriod === period.id;
            return (
              <div key={period.id} className={`flex items-center gap-1.5 ${isCurrentPeriod ? 'ring-1 ring-white/30 rounded-lg px-2 py-1' : ''}`}>
                <div 
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${period.color}25` }}
                >
                  <Icon size={12} style={{ color: period.color }} />
                </div>
                <span className="text-gray-400 text-xs hidden md:inline">{period.name}</span>
                {isCurrentPeriod && <span className="text-[10px] text-green-400">●</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={hourlyData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={TIME_PERIODS.morning.color} stopOpacity={0.9} />
                <stop offset="33%" stopColor={TIME_PERIODS.afternoon.color} stopOpacity={0.9} />
                <stop offset="66%" stopColor={TIME_PERIODS.evening.color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={TIME_PERIODS.night.color} stopOpacity={0.9} />
              </linearGradient>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.7} />
                <stop offset="30%" stopColor="#06b6d4" stopOpacity={0.5} />
                <stop offset="70%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ec4899" stopOpacity={0.1} />
              </linearGradient>
              {/* Glow effect for line */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
            
            <XAxis 
              dataKey="label" 
              tick={({ x, y, payload }) => {
                const dataPoint = hourlyData.find(h => h.label === payload.value);
                const isFuture = dataPoint?.isFuture;
                return (
                  <text 
                    x={x} 
                    y={y + 10} 
                    textAnchor="middle" 
                    fill={isFuture ? '#4b5563' : '#9ca3af'} 
                    fontSize={10}
                    style={{ opacity: isFuture ? 0.5 : 1 }}
                  >
                    {payload.value}
                  </text>
                );
              }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
              interval={2}
            />
            
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            {/* Reference lines for time period boundaries */}
            <ReferenceLine x="12 PM" stroke={TIME_PERIODS.afternoon.color} strokeDasharray="5 5" opacity={0.5} />
            <ReferenceLine x="6 PM" stroke={TIME_PERIODS.evening.color} strokeDasharray="5 5" opacity={0.5} />
            <ReferenceLine x="10 PM" stroke={TIME_PERIODS.night.color} strokeDasharray="5 5" opacity={0.5} />
            
            {/* Goal line */}
            <ReferenceLine 
              y={80} 
              stroke="#22c55e" 
              strokeDasharray="5 5" 
              label={{ value: 'Goal', fill: '#22c55e', fontSize: 10, position: 'right' }} 
            />
            
            <Area
              type="natural"
              dataKey="completion"
              stroke="url(#trendGradient)"
              strokeWidth={4}
              fill="url(#trendFill)"
              dot={<CustomDot />}
              activeDot={{ r: 8, fill: '#e91e63', stroke: '#fff', strokeWidth: 3, filter: 'url(#glow)' }}
              connectNulls={false}
              style={{ filter: 'url(#glow)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Time Period Labels - Show average percentage */}
      <div className="flex justify-between mt-3 px-4">
        {Object.entries(TIME_PERIODS).map(([key, period]) => {
          const Icon = PERIOD_ICONS[key];
          const value = getPeriodAverageCompletion(key);
          const isCurrentPeriod = currentPeriod === key;
          
          return (
            <div 
              key={key}
              className={`text-center flex-1 flex items-center justify-center gap-1.5 py-1 rounded ${isCurrentPeriod ? 'bg-white/5' : ''}`}
            >
              <Icon size={14} style={{ color: period.color }} />
              <span 
                className="text-xs font-medium"
                style={{ color: period.color }}
              >
                {value}%
              </span>
              {value === 100 && <CheckCircle2 size={10} className="text-green-400" />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyProgressTrendChart;
