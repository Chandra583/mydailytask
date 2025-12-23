import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { useHabit, TIME_PERIODS } from '../../context/HabitContext';
import { format, subDays } from 'date-fns';

/**
 * Bottom Overview Component - Daily View
 * Shows time period breakdown and weekly summary
 */
const BottomOverview = () => {
  const { dailyStats, selectedDate } = useHabit();

  // Time period data for today
  const timePeriodData = [
    {
      name: 'Morning',
      icon: TIME_PERIODS.morning.icon,
      completion: dailyStats?.morning || 0,
      color: TIME_PERIODS.morning.color,
    },
    {
      name: 'Afternoon',
      icon: TIME_PERIODS.afternoon.icon,
      completion: dailyStats?.afternoon || 0,
      color: TIME_PERIODS.afternoon.color,
    },
    {
      name: 'Evening',
      icon: TIME_PERIODS.evening.icon,
      completion: dailyStats?.evening || 0,
      color: TIME_PERIODS.evening.color,
    },
    {
      name: 'Night',
      icon: TIME_PERIODS.night.icon,
      completion: dailyStats?.night || 0,
      color: TIME_PERIODS.night.color,
    },
  ];

  // Generate last 7 days data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(selectedDate, 6 - i);
    const isToday = i === 6;
    // Mock data - in real app, fetch from API
    const completion = isToday ? (dailyStats?.overall || 0) : Math.floor(Math.random() * 100);
    
    return {
      day: format(date, 'EEE'),
      date: format(date, 'MMM d'),
      completion,
      isToday,
    };
  });

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-primary-slate p-3 rounded-lg shadow-lg border border-gray-600">
          <p className="text-white font-bold">{data.icon || ''} {data.name || data.day}</p>
          <p className="text-accent-pink text-lg font-bold">{data.completion}%</p>
          {data.date && <p className="text-gray-400 text-xs">{data.date}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-primary-navy rounded-lg p-4">
      <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
        <span>📊</span>
        OVERVIEW
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Progress by Time Period */}
        <div>
          <h4 className="text-gray-400 text-sm mb-3">Today's Progress by Time</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timePeriodData} layout="vertical">
                <XAxis 
                  type="number" 
                  domain={[0, 100]} 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  width={80}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completion" radius={[0, 4, 4, 0]}>
                  {timePeriodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Time Period Stats */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            {timePeriodData.map((period) => (
              <div 
                key={period.name}
                className="text-center p-2 rounded-lg"
                style={{ backgroundColor: `${period.color}20` }}
              >
                <div className="text-lg">{period.icon}</div>
                <div className="text-white font-bold text-sm">{period.completion}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Summary */}
        <div>
          <h4 className="text-gray-400 text-sm mb-3">Last 7 Days</h4>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <XAxis 
                  dataKey="day" 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completion" radius={[4, 4, 0, 0]}>
                  {weeklyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isToday ? '#e91e63' : 
                            entry.completion >= 80 ? '#10b981' :
                            entry.completion >= 50 ? '#ffc107' :
                            entry.completion >= 25 ? '#f97316' : '#ef4444'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Progress Bars */}
          <div className="grid grid-cols-7 gap-1 mt-4">
            {weeklyData.map((day, index) => (
              <div key={index} className="text-center">
                <div 
                  className="h-2 rounded-full transition-all"
                  style={{
                    backgroundColor: day.isToday ? '#e91e63' :
                      day.completion >= 80 ? '#10b981' :
                      day.completion >= 50 ? '#ffc107' : '#374151',
                  }}
                ></div>
                <span className={`text-xs ${day.isToday ? 'text-accent-pink font-bold' : 'text-gray-500'}`}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-700">
        <div className="text-center">
          <div className="text-gray-400 text-xs mb-1">Today Overall</div>
          <div className="text-white font-bold text-2xl">{dailyStats?.overall || 0}%</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-xs mb-1">Best Period</div>
          <div className="text-white font-bold text-lg">
            {timePeriodData.reduce((a, b) => a.completion > b.completion ? a : b).icon}
            {timePeriodData.reduce((a, b) => a.completion > b.completion ? a : b).name}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-xs mb-1">Completed</div>
          <div className="text-green-400 font-bold text-2xl">{dailyStats?.completed || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400 text-xs mb-1">Remaining</div>
          <div className="text-orange-400 font-bold text-2xl">{dailyStats?.remaining || 0}</div>
        </div>
      </div>
    </div>
  );
};

export default BottomOverview;
