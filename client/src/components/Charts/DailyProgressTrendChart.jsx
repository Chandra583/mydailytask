import React, { useMemo } from 'react';
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
import { TrendingUp, Sun, Sunrise, Sunset, Moon } from 'lucide-react';

// Period icons mapping
const PERIOD_ICONS = {
  morning: Sun,
  afternoon: Sunrise,
  evening: Sunset,
  night: Moon,
};

/**
 * Daily Progress Trend Chart
 * Modern 2025 design with Lucide icons and glassmorphism
 */
const DailyProgressTrendChart = () => {
  const { dailyStats } = useHabit();
  const currentPeriod = getCurrentTimePeriod();
  const currentHour = new Date().getHours();

  // Generate hourly data points based on actual period completion data
  const hourlyData = useMemo(() => {
    const hours = [
      { hour: 6, label: '6 AM', period: 'morning' },
      { hour: 7, label: '7 AM', period: 'morning' },
      { hour: 8, label: '8 AM', period: 'morning' },
      { hour: 9, label: '9 AM', period: 'morning' },
      { hour: 10, label: '10 AM', period: 'morning' },
      { hour: 11, label: '11 AM', period: 'morning' },
      { hour: 12, label: '12 PM', period: 'afternoon' },
      { hour: 13, label: '1 PM', period: 'afternoon' },
      { hour: 14, label: '2 PM', period: 'afternoon' },
      { hour: 15, label: '3 PM', period: 'afternoon' },
      { hour: 16, label: '4 PM', period: 'afternoon' },
      { hour: 17, label: '5 PM', period: 'afternoon' },
      { hour: 18, label: '6 PM', period: 'evening' },
      { hour: 19, label: '7 PM', period: 'evening' },
      { hour: 20, label: '8 PM', period: 'evening' },
      { hour: 21, label: '9 PM', period: 'evening' },
      { hour: 22, label: '10 PM', period: 'night' },
      { hour: 23, label: '11 PM', period: 'night' },
      { hour: 0, label: '12 AM', period: 'night' },
    ];

    return hours.map((h, index) => {
      // Get the actual period completion value from dailyStats
      const periodValue = dailyStats?.[h.period] || 0;
      
      // Calculate progression within the period
      // Each period shows gradual increase up to the period's completion value
      const periodStart = h.period === 'morning' ? 6 : 
                         h.period === 'afternoon' ? 12 : 
                         h.period === 'evening' ? 18 : 22;
      const periodDuration = h.period === 'night' ? 8 : 6;
      
      let hoursIntoPeriod;
      if (h.period === 'night' && h.hour < 6) {
        hoursIntoPeriod = h.hour + 2; // Night wraps around
      } else {
        hoursIntoPeriod = h.hour - periodStart;
      }
      
      // Calculate the completion value for this hour within the period
      // Shows gradual buildup within each period
      const progressRatio = (hoursIntoPeriod + 1) / periodDuration;
      const completion = Math.round(periodValue * progressRatio);
      
      return {
        ...h,
        completion: Math.min(100, completion),
        periodValue, // Full period value for reference
        color: TIME_PERIODS[h.period].color,
        isCurrent: h.hour === currentHour,
      };
    });
  }, [dailyStats, currentHour]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-primary-slate p-3 rounded-lg shadow-lg border border-gray-600">
          <p className="text-white font-bold">{data.label}</p>
          <p className="text-lg font-bold" style={{ color: data.color }}>
            {data.completion}% completion
          </p>
          <p className="text-gray-400 text-xs capitalize">
            {data.period} ({data.periodValue}% total)
          </p>
          {data.isCurrent && (
            <p className="text-green-400 text-xs mt-1">← Current time</p>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom dot to highlight current hour
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.isCurrent) {
      return (
        <g>
          <circle cx={cx} cy={cy} r={8} fill={payload.color} opacity={0.3} />
          <circle cx={cx} cy={cy} r={5} fill={payload.color} stroke="#fff" strokeWidth={2} />
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
          <p className="text-gray-500 text-xs mt-1">Completion throughout the day</p>
        </div>
        <div className="flex items-center gap-3">
          {Object.values(TIME_PERIODS).map((period) => {
            const Icon = PERIOD_ICONS[period.id];
            return (
              <div key={period.id} className="flex items-center gap-1.5">
                <div 
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${period.color}25` }}
                >
                  <Icon size={12} style={{ color: period.color }} />
                </div>
                <span className="text-gray-400 text-xs hidden md:inline">{period.name}</span>
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
                <stop offset="0%" stopColor={TIME_PERIODS.morning.color} stopOpacity={0.8} />
                <stop offset="33%" stopColor={TIME_PERIODS.afternoon.color} stopOpacity={0.8} />
                <stop offset="66%" stopColor={TIME_PERIODS.evening.color} stopOpacity={0.8} />
                <stop offset="100%" stopColor={TIME_PERIODS.night.color} stopOpacity={0.8} />
              </linearGradient>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                <stop offset="50%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.5} />
            
            <XAxis 
              dataKey="label" 
              tick={{ fill: '#9ca3af', fontSize: 10 }}
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
              type="monotone"
              dataKey="completion"
              stroke="url(#trendGradient)"
              strokeWidth={3}
              fill="url(#trendFill)"
              dot={<CustomDot />}
              activeDot={{ r: 6, fill: '#e91e63', stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Time Period Labels */}
      <div className="flex justify-between mt-3 px-4">
        {Object.entries(TIME_PERIODS).map(([key, period]) => {
          const Icon = PERIOD_ICONS[key];
          const value = dailyStats?.[key] || 0;
          return (
            <div 
              key={key}
              className="text-center flex-1 flex items-center justify-center gap-1.5"
            >
              <Icon size={14} style={{ color: period.color }} />
              <span 
                className="text-xs font-medium"
                style={{ color: period.color }}
              >
                {value}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyProgressTrendChart;
