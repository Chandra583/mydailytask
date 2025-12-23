import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useHabit } from '../../context/HabitContext';

/**
 * Today Progress Donut Chart
 * Shows overall completion for today with segments
 */
const TodayProgressDonut = () => {
  const { habits, dailyProgress, dailyStats } = useHabit();

  // Calculate completion segments
  const calculateSegments = () => {
    let completed = 0;    // 100%
    let inProgress = 0;   // 1-99%
    let notStarted = 0;   // 0%

    habits.forEach(habit => {
      const progress = dailyProgress[habit._id] || {};
      // Count each time period
      ['morning', 'afternoon', 'evening', 'night'].forEach(period => {
        const value = progress[period] || 0;
        if (value === 100) completed++;
        else if (value > 0) inProgress++;
        else notStarted++;
      });
    });

    return { completed, inProgress, notStarted };
  };

  const segments = calculateSegments();
  const total = segments.completed + segments.inProgress + segments.notStarted;

  const chartData = [
    { name: 'Completed', value: segments.completed, color: '#4ade80' },
    { name: 'In Progress', value: segments.inProgress, color: '#fbbf24' },
    { name: 'Not Started', value: segments.notStarted, color: '#374151' },
  ].filter(d => d.value > 0);

  // If no data, show empty state
  if (total === 0) {
    chartData.push({ name: 'No Data', value: 1, color: '#374151' });
  }

  const overallPercentage = dailyStats?.overall || 0;

  return (
    <div className="bg-primary-navy rounded-lg p-4">
      <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
        <span>🎯</span>
        TODAY'S PROGRESS
      </h3>

      {/* Donut Chart */}
      <div className="relative h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
              animationDuration={800}
              animationBegin={0}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="transparent"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{overallPercentage}%</span>
          <span className="text-gray-400 text-xs">Complete</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 mt-4">
        <div className="flex items-center justify-between p-2 bg-primary-slate rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#4ade80]"></div>
            <span className="text-white text-sm">✓ Completed (100%)</span>
          </div>
          <span className="text-green-400 font-bold">{segments.completed}</span>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-primary-slate rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#fbbf24]"></div>
            <span className="text-white text-sm">○ In Progress (1-99%)</span>
          </div>
          <span className="text-yellow-400 font-bold">{segments.inProgress}</span>
        </div>
        
        <div className="flex items-center justify-between p-2 bg-primary-slate rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#374151]"></div>
            <span className="text-white text-sm">✗ Not Started (0%)</span>
          </div>
          <span className="text-gray-400 font-bold">{segments.notStarted}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{habits.length}</div>
            <div className="text-gray-400 text-xs">Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{total}</div>
            <div className="text-gray-400 text-xs">Total Cells</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">{segments.completed}</div>
            <div className="text-gray-400 text-xs">Done</div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {overallPercentage >= 80 && (
        <div className="mt-4 p-3 bg-green-900 bg-opacity-30 rounded-lg border border-green-700">
          <p className="text-green-400 text-sm text-center flex items-center justify-center gap-2">
            <span>🎉</span>
            Great progress today! Keep it up!
          </p>
        </div>
      )}
    </div>
  );
};

export default TodayProgressDonut;
