import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList } from 'recharts';
import { useHabit, TIME_PERIODS, getCurrentTimePeriod } from '../../context/HabitContext';

/**
 * Daily Progress Chart Component
 * Bar chart showing completion percentage for each time period
 */
const DailyProgressChart = () => {
  const { dailyStats } = useHabit();
  const currentPeriod = getCurrentTimePeriod();

  const chartData = [
    {
      name: 'Morning',
      icon: TIME_PERIODS.morning.icon,
      percentage: dailyStats?.morning || 0,
      color: TIME_PERIODS.morning.color,
      isCurrent: currentPeriod === 'morning',
    },
    {
      name: 'Afternoon',
      icon: TIME_PERIODS.afternoon.icon,
      percentage: dailyStats?.afternoon || 0,
      color: TIME_PERIODS.afternoon.color,
      isCurrent: currentPeriod === 'afternoon',
    },
    {
      name: 'Evening',
      icon: TIME_PERIODS.evening.icon,
      percentage: dailyStats?.evening || 0,
      color: TIME_PERIODS.evening.color,
      isCurrent: currentPeriod === 'evening',
    },
    {
      name: 'Night',
      icon: TIME_PERIODS.night.icon,
      percentage: dailyStats?.night || 0,
      color: TIME_PERIODS.night.color,
      isCurrent: currentPeriod === 'night',
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-primary-slate p-3 rounded-lg shadow-lg border border-gray-600">
          <p className="text-lg font-bold text-white flex items-center gap-2">
            <span>{data.icon}</span>
            {data.name}
          </p>
          <p className="text-2xl font-bold" style={{ color: data.color }}>
            {data.percentage}%
          </p>
          {data.isCurrent && (
            <p className="text-xs text-green-400 mt-1">← Current Period</p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomXAxisTick = ({ x, y, payload }) => {
    const data = chartData.find(d => d.name === payload.value);
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor="middle"
          fill={data?.isCurrent ? '#ffffff' : '#9ca3af'}
          className="text-sm font-medium"
        >
          {data?.icon} {payload.value}
        </text>
        {data?.isCurrent && (
          <text
            x={0}
            y={0}
            dy={32}
            textAnchor="middle"
            fill="#22c55e"
            className="text-xs"
          >
            Now
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="bg-primary-navy rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-bold text-lg">Daily Task Progress by Time Period</h3>
          <p className="text-gray-400 text-sm">Completion percentage across the day</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-primary-slate rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-green-400 text-xs font-medium">Live</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
          >
            <defs>
              {Object.values(TIME_PERIODS).map((period) => (
                <linearGradient
                  key={period.id}
                  id={`gradient-${period.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={period.color} stopOpacity={1} />
                  <stop offset="100%" stopColor={period.color} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            
            <XAxis
              dataKey="name"
              tick={<CustomXAxisTick />}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
            />
            
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <ReferenceLine y={80} stroke="#22c55e" strokeDasharray="5 5" label={{ value: 'Goal', fill: '#22c55e', fontSize: 10 }} />
            
            <Bar
              dataKey="percentage"
              radius={[8, 8, 0, 0]}
              maxBarSize={80}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`url(#gradient-${Object.keys(TIME_PERIODS)[index]})`}
                  stroke={entry.isCurrent ? '#ffffff' : 'transparent'}
                  strokeWidth={entry.isCurrent ? 2 : 0}
                />
              ))}
              <LabelList
                dataKey="percentage"
                position="top"
                fill="#ffffff"
                formatter={(value) => `${value}%`}
                className="font-bold text-sm"
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-gray-700">
        {chartData.map((period) => (
          <div
            key={period.name}
            className={`p-2 rounded-lg text-center transition-all ${
              period.isCurrent ? 'ring-2 ring-white ring-opacity-50' : ''
            }`}
            style={{ backgroundColor: `${period.color}20` }}
          >
            <div className="text-lg">{period.icon}</div>
            <div className="text-white font-bold">{period.percentage}%</div>
            <div className="text-gray-400 text-xs">{period.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DailyProgressChart;
