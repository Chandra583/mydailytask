import React, { useMemo } from 'react';
import { useHabit } from '../../context/HabitContext';

/**
 * Completion Distribution Chart
 * Shows distribution of tasks by completion percentage level
 */
const CompletionDistributionChart = () => {
  const { habits, dailyProgress, progressResetKey } = useHabit();

  // Calculate distribution of tasks by completion level
  // GOLDEN RULE: ALL values derived from dailyProgress, never from habit properties
  // If ANY time period is 100%, task is considered "100% Complete"
  const distribution = useMemo(() => {
    console.log(`📊 Recalculating distribution (resetKey: ${progressResetKey})`);
    
    const dist = {
      complete: { count: 0, label: '100% Complete', color: '#4ade80', icon: '✓' },
      high: { count: 0, label: '80-99%', color: '#86efac', icon: '●' },
      medium: { count: 0, label: '50-79%', color: '#fbbf24', icon: '●' },
      low: { count: 0, label: '20-49%', color: '#fb923c', icon: '●' },
      minimal: { count: 0, label: '0-19%', color: '#ef4444', icon: '○' },
    };

    habits.forEach(habit => {
      const progress = dailyProgress[habit._id] || {};
      const morning = progress.morning || 0;
      const afternoon = progress.afternoon || 0;
      const evening = progress.evening || 0;
      const night = progress.night || 0;

      // Check if ANY period is 100% - task is complete
      if (morning === 100 || afternoon === 100 || evening === 100 || night === 100) {
        dist.complete.count++;
      } else {
        // Use highest completion percentage for categorization
        const maxCompletion = Math.max(morning, afternoon, evening, night);
        
        if (maxCompletion >= 80) dist.high.count++;
        else if (maxCompletion >= 50) dist.medium.count++;
        else if (maxCompletion >= 20) dist.low.count++;
        else dist.minimal.count++;
      }
    });

    return dist;
  }, [habits, dailyProgress, progressResetKey]);

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

      {/* Summary - Compact */}
      <div className="mt-3 pt-3 border-t border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Total:</span>
            <span className="text-white font-bold">{habits.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Complete:</span>
            <span className="text-green-400 font-bold">{distribution.complete.count}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Needs work:</span>
            <span className="text-red-400 font-bold">{distribution.minimal.count + distribution.low.count}</span>
          </div>
        </div>
      </div>

      {/* Visual Breakdown */}
      <div className="mt-3 flex gap-0.5 h-3 rounded-full overflow-hidden">
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

      {/* Legend - Compact single row */}
      <div className="flex flex-wrap gap-2 mt-2 justify-center">
        {categories.filter(c => c.count > 0).slice(0, 3).map((category, index) => (
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
