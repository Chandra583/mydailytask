import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  LabelList
} from 'recharts';
import { useHabit, TIME_PERIODS, getCurrentTimePeriod } from '../../context/HabitContext';

/**
 * Time Period Performance Bar Chart
 * Vertical grouped bars showing completion for each time period
 */
const TimePeriodBarChart = () => {
  const { dailyStats } = useHabit();
  const currentPeriod = getCurrentTimePeriod();

  const chartData = [
    {
      name: 'Morning',
      icon: '🌅',
      completion: dailyStats?.morning || 0,
      color: TIME_PERIODS.morning.color,
      timeRange: '6 AM - 12 PM',
    },
    {
      name: 'Afternoon',
      icon: '☀️',
      completion: dailyStats?.afternoon || 0,
      color: TIME_PERIODS.afternoon.color,
      timeRange: '12 PM - 6 PM',
    },
    {
      name: 'Evening',
      icon: '🌆',
      completion: dailyStats?.evening || 0,
      color: TIME_PERIODS.evening.color,
      timeRange: '6 PM - 10 PM',
    },
    {
      name: 'Night',
      icon: '🌙',
      completion: dailyStats?.night || 0,
      color: TIME_PERIODS.night.color,
      timeRange: '10 PM - 6 AM',
    },
  ];

  // Find best and worst performing periods
  const sortedData = [...chartData].sort((a, b) => b.completion - a.completion);
  const bestPeriod = sortedData[0]?.name;
  const worstPeriod = sortedData[sortedData.length - 1]?.name;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-primary-slate p-3 rounded-lg shadow-lg border border-gray-600">
          <p className="text-white font-bold flex items-center gap-2">
            <span>{data.icon}</span>
            {data.name}
          </p>
          <p className="text-2xl font-bold" style={{ color: data.color }}>
            {data.completion}%
          </p>
          <p className="text-gray-400 text-xs">{data.timeRange}</p>
          {data.name === bestPeriod && (
            <p className="text-green-400 text-xs mt-1">🏆 Best Performance!</p>
          )}
          {data.name === worstPeriod && data.completion < 50 && (
            <p className="text-orange-400 text-xs mt-1">⚠️ Needs Focus</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-primary-navy rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            <span>📊</span>
            DAILY TASK PROGRESS BY TIME
          </h3>
          <p className="text-gray-400 text-sm">Task completion percentage per time period</p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
          >
            <defs>
              {chartData.map((entry) => (
                <linearGradient
                  key={entry.name}
                  id={`barGradient-${entry.name}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={entry.color} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            
            <XAxis 
              dataKey="name" 
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
            
            <Bar 
              dataKey="completion" 
              radius={[8, 8, 0, 0]}
              maxBarSize={60}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#barGradient-${entry.name})`}
                  stroke={entry.name === bestPeriod ? '#fff' : 'transparent'}
                  strokeWidth={entry.name === bestPeriod ? 2 : 0}
                  style={{
                    filter: entry.name === bestPeriod ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none'
                  }}
                />
              ))}
              <LabelList 
                dataKey="completion" 
                position="top" 
                fill="#ffffff"
                fontSize={12}
                fontWeight="bold"
                formatter={(value) => `${value}%`}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-gray-700">
        {chartData.map((period) => (
          <div 
            key={period.name}
            className={`p-2 rounded-lg text-center transition-all ${
              period.name === bestPeriod ? 'ring-2 ring-green-500 ring-opacity-50' : ''
            }`}
            style={{ backgroundColor: `${period.color}15` }}
          >
            <div className="text-lg">{period.icon}</div>
            <div className="text-white font-bold text-lg">{period.completion}%</div>
            <div className="text-gray-400 text-xs">{period.name}</div>
            {period.name === bestPeriod && period.completion > 0 && (
              <div className="text-green-400 text-xs mt-1">Best! 🏆</div>
            )}
            {period.name === worstPeriod && period.completion < 50 && (
              <div className="text-orange-400 text-xs mt-1">Focus 🎯</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimePeriodBarChart;
