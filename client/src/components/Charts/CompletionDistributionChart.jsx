import React from 'react';
import { useHabit } from '../../context/HabitContext';

/**
 * Completion Distribution Chart
 * Shows distribution of tasks by completion percentage level
 */
const CompletionDistributionChart = () => {
  const { habits, dailyProgress } = useHabit();

  // Calculate distribution of tasks by completion level
  const calculateDistribution = () => {
    const distribution = {
      complete: { count: 0, label: '100% Complete', color: '#4ade80', icon: '✓' },
      high: { count: 0, label: '80-99%', color: '#86efac', icon: '●' },
      medium: { count: 0, label: '50-79%', color: '#fbbf24', icon: '●' },
      low: { count: 0, label: '20-49%', color: '#fb923c', icon: '●' },
      minimal: { count: 0, label: '0-19%', color: '#ef4444', icon: '○' },
    };

    habits.forEach(habit => {
      const progress = dailyProgress[habit._id] || {};
      const avgCompletion = Math.round(
        ((progress.morning || 0) + (progress.afternoon || 0) + 
         (progress.evening || 0) + (progress.night || 0)) / 4
      );

      if (avgCompletion === 100) distribution.complete.count++;
      else if (avgCompletion >= 80) distribution.high.count++;
      else if (avgCompletion >= 50) distribution.medium.count++;
      else if (avgCompletion >= 20) distribution.low.count++;
      else distribution.minimal.count++;
    });

    return distribution;
  };

  const distribution = calculateDistribution();
  const totalHabits = habits.length || 1;

  // Calculate percentages
  const getPercentage = (count) => Math.round((count / totalHabits) * 100);

  const categories = [
    { ...distribution.complete, percentage: getPercentage(distribution.complete.count) },
    { ...distribution.high, percentage: getPercentage(distribution.high.count) },
    { ...distribution.medium, percentage: getPercentage(distribution.medium.count) },
    { ...distribution.low, percentage: getPercentage(distribution.low.count) },
    { ...distribution.minimal, percentage: getPercentage(distribution.minimal.count) },
  ];

  return (
    <div className="bg-primary-navy rounded-lg p-4">
      <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
        <span>📊</span>
        COMPLETION STATUS
      </h3>

      {/* Distribution Bars */}
      <div className="space-y-3">
        {categories.map((category, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span style={{ color: category.color }}>{category.icon}</span>
                <span className="text-gray-300">{category.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-bold">{category.count}</span>
                <span className="text-gray-400 text-xs">({category.percentage}%)</span>
              </div>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700"
                style={{ 
                  width: `${category.percentage}%`,
                  backgroundColor: category.color,
                  minWidth: category.count > 0 ? '8px' : '0'
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 text-sm">Total Tasks</span>
          <span className="text-white font-bold text-lg">{habits.length}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-400 text-sm">Fully Complete</span>
          <span className="text-green-400 font-bold">
            {distribution.complete.count} ({getPercentage(distribution.complete.count)}%)
          </span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-gray-400 text-sm">Needs Attention</span>
          <span className="text-red-400 font-bold">
            {distribution.minimal.count + distribution.low.count}
          </span>
        </div>
      </div>

      {/* Visual Breakdown */}
      <div className="mt-4 flex gap-1 h-4 rounded-full overflow-hidden">
        {categories.map((category, index) => (
          category.count > 0 && (
            <div
              key={index}
              className="transition-all duration-500"
              style={{
                width: `${category.percentage}%`,
                backgroundColor: category.color,
              }}
              title={`${category.label}: ${category.count} tasks (${category.percentage}%)`}
            ></div>
          )
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {categories.filter(c => c.count > 0).map((category, index) => (
          <div key={index} className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: category.color }}
            ></div>
            <span className="text-gray-400 text-xs">{category.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CompletionDistributionChart;
